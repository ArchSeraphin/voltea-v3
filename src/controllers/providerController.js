'use strict';

const { body, validationResult } = require('express-validator');
const providerModel = require('../models/providerModel');
const prerenderService = require('../services/prerenderService');

function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 200);
}

async function uniqueSlug(base, excludeId = null) {
  let slug = base || 'fournisseur';
  let counter = 2;
  while (await providerModel.slugExists(slug, excludeId)) {
    slug = `${base}-${counter}`;
    counter++;
  }
  return slug;
}

const providerValidation = [
  body('name').trim().notEmpty().withMessage('Le nom est requis').isLength({ max: 200 }).withMessage('200 caractères maximum'),
  body('slug').optional({ checkFalsy: true }).trim().matches(/^[a-z0-9-]+$/).withMessage('Slug invalide : minuscules, chiffres et tirets uniquement').isLength({ max: 200 }),
  body('fullName').optional({ checkFalsy: true }).trim().isLength({ max: 255 }).withMessage('255 caractères maximum'),
  body('logoUrl').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
  body('tagline').optional({ checkFalsy: true }).trim().isLength({ max: 500 }).withMessage('500 caractères maximum'),
  body('category').optional({ checkFalsy: true }).trim().isLength({ max: 100 }).withMessage('100 caractères maximum'),
  body('description').optional().isArray().withMessage('Format invalide'),
  body('offers').optional().isArray().withMessage('Format invalide'),
  body('pros').optional().isArray().withMessage('Format invalide'),
  body('cons').optional().isArray().withMessage('Format invalide'),
  body('profiles').optional().isArray().withMessage('Format invalide'),
  body('published').optional().isBoolean().withMessage('Format invalide'),
];

function normalizeBody(raw) {
  return {
    name: raw.name,
    fullName: raw.fullName || '',
    logoUrl: raw.logoUrl || '',
    tagline: raw.tagline || '',
    category: raw.category || '',
    description: providerModel.cleanStringList(raw.description),
    offers: providerModel.cleanOffers(raw.offers),
    pros: providerModel.cleanStringList(raw.pros),
    cons: providerModel.cleanStringList(raw.cons),
    profiles: providerModel.cleanStringList(raw.profiles),
    published: Boolean(raw.published),
  };
}

// Fire-and-forget : la régénération SEO ne doit jamais faire échouer la requête.
function regenerate(routes) {
  try { prerenderService.queueRegeneration(routes); } catch (err) {
    console.error('[prerender] queue échouée:', err.message);
  }
}

function removePrerendered(route) {
  try { prerenderService.removeRoute(route); } catch (err) {
    console.error('[prerender] suppression échouée:', err.message);
  }
}

// Public
async function getProviders(req, res) {
  try {
    res.json({ providers: await providerModel.getPublishedProviders() });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function getProviderBySlug(req, res) {
  try {
    const provider = await providerModel.getPublishedProviderBySlug(req.params.slug);
    if (!provider) return res.status(404).json({ error: 'Fournisseur introuvable' });
    res.json(provider);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// Admin
async function getAdminProviders(req, res) {
  try {
    res.json({ providers: await providerModel.getAllProviders() });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function createProvider(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  try {
    const data = normalizeBody(req.body);
    const base = req.body.slug ? slugify(req.body.slug) : slugify(data.name);
    data.slug = await uniqueSlug(base);
    const provider = await providerModel.createProvider(data);
    if (provider.published) {
      regenerate([`/guide-energie/${provider.slug}`, '/guide-energie']);
    }
    res.status(201).json(provider);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function updateProvider(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  try {
    const before = await providerModel.getProviderById(req.params.id);
    if (!before) return res.status(404).json({ error: 'Fournisseur introuvable' });

    const data = normalizeBody(req.body);
    const base = req.body.slug ? slugify(req.body.slug) : slugify(data.name);
    data.slug = base === before.slug ? before.slug : await uniqueSlug(base, before.id);

    const after = await providerModel.updateProvider(before.id, data);

    // L'ancienne fiche prérendue meurt si dépubliée ou si le slug change.
    if (before.published && (!after.published || before.slug !== after.slug)) {
      removePrerendered(`/guide-energie/${before.slug}`);
    }
    if (after.published) {
      regenerate([`/guide-energie/${after.slug}`, '/guide-energie']);
    } else if (before.published) {
      regenerate(['/guide-energie']);
    }
    res.json(after);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function deleteProvider(req, res) {
  try {
    const before = await providerModel.getProviderById(req.params.id);
    if (!before) return res.status(404).json({ error: 'Fournisseur introuvable' });
    await providerModel.deleteProvider(before.id);
    if (before.published) {
      removePrerendered(`/guide-energie/${before.slug}`);
      regenerate(['/guide-energie']);
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function togglePublished(req, res) {
  try {
    const after = await providerModel.togglePublished(req.params.id);
    if (!after) return res.status(404).json({ error: 'Fournisseur introuvable' });
    if (after.published) {
      regenerate([`/guide-energie/${after.slug}`, '/guide-energie']);
    } else {
      removePrerendered(`/guide-energie/${after.slug}`);
      regenerate(['/guide-energie']);
    }
    res.json(after);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function reorderProviders(req, res) {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0 || !ids.every((n) => Number.isInteger(n))) {
    return res.status(422).json({ errors: [{ path: 'ids', msg: "Liste d'identifiants invalide" }] });
  }
  try {
    await providerModel.reorderProviders(ids);
    regenerate(['/guide-energie']);
    res.json({ providers: await providerModel.getAllProviders() });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = {
  providerValidation,
  getProviders,
  getProviderBySlug,
  getAdminProviders,
  createProvider,
  updateProvider,
  deleteProvider,
  togglePublished,
  reorderProviders,
};
