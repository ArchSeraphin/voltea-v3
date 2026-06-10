'use strict';

// Authoritative list of public routes. Used by sitemap + 404 resolver.
// Keep in sync with client/src/App.jsx <Routes>.
// Les fiches fournisseurs (/guide-energie/:slug) et les articles
// (/actualites/:slug) sont dynamiques : résolus en BDD par app.js, ajoutés au
// sitemap par src/routes/sitemap.js.

const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/a-propos', priority: '0.8', changefreq: 'monthly' },
  { path: '/services', priority: '0.9', changefreq: 'monthly' },
  { path: '/marche-energie', priority: '0.7', changefreq: 'weekly' },
  { path: '/guide-energie', priority: '0.8', changefreq: 'monthly' },
  { path: '/actualites', priority: '0.8', changefreq: 'daily' },
  { path: '/faq', priority: '0.7', changefreq: 'monthly' },
  { path: '/contact', priority: '0.7', changefreq: 'monthly' },
  { path: '/mentions-legales', priority: '0.3', changefreq: 'yearly', noindex: true },
  { path: '/politique-de-confidentialite', priority: '0.3', changefreq: 'yearly', noindex: true },
];

// Admin routes — excluded from sitemap, but valid URLs so the SPA should serve them.
const ADMIN_PREFIXES = [
  '/admin',
];

const INDEXABLE_ROUTES = STATIC_ROUTES.filter((r) => !r.noindex);
const SITEMAP_ROUTES = STATIC_ROUTES.filter((r) => !r.noindex);

// Known-valid exact paths (no dynamic segments)
const KNOWN_PATHS = new Set(STATIC_ROUTES.map((r) => r.path));

// Dynamic prefixes — caller must verify the slug against the DB
const DYNAMIC_PREFIXES = [
  '/actualites/', // /actualites/:slug
  '/guide-energie/', // /guide-energie/:slug
];

module.exports = {
  STATIC_ROUTES,
  SITEMAP_ROUTES,
  INDEXABLE_ROUTES,
  ADMIN_PREFIXES,
  KNOWN_PATHS,
  DYNAMIC_PREFIXES,
};
