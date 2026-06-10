import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../App.jsx';
import { AdminSidebar } from './Dashboard.jsx';
import SEO from '../../components/SEO.jsx';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 200);
}

const CATEGORIES = ['Historique', 'Alternatif', 'Vert & Indépendant'];
const KNOWN_PROFILES = ['TPE', 'PME', 'ETI', 'Industrie', 'Multi-sites', 'Copropriétés', 'Grands comptes'];

// Liste de champs texte avec ajout/suppression — zéro JSON visible pour Jérémy.
function ListField({ label, hint, items, onChange, placeholder, addLabel, multiline = false }) {
  function update(i, value) {
    const next = [...items];
    next[i] = value;
    onChange(next);
  }
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {hint && <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '0 0 0.5rem' }}>{hint}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            {multiline ? (
              <textarea
                className="form-textarea"
                value={item}
                rows={3}
                style={{ minHeight: '70px', flex: 1 }}
                placeholder={placeholder}
                onChange={(e) => update(i, e.target.value)}
              />
            ) : (
              <input
                type="text"
                className="form-input"
                value={item}
                style={{ flex: 1 }}
                placeholder={placeholder}
                onChange={(e) => update(i, e.target.value)}
              />
            )}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              title="Supprimer cette ligne"
              style={{ color: '#ef4444', padding: '0.45rem 0.6rem' }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-outline btn-sm" onClick={() => onChange([...items, ''])} style={{ marginTop: '0.5rem' }}>
        + {addLabel}
      </button>
    </div>
  );
}

// Offres : lignes intitulé + description courte.
function OffersField({ offers, onChange }) {
  function update(i, key, value) {
    const next = offers.map((o, idx) => (idx === i ? { ...o, [key]: value } : o));
    onChange(next);
  }
  return (
    <div className="form-group">
      <label className="form-label">Offres proposées</label>
      <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '0 0 0.5rem' }}>
        Ex. « Électricité », « Gaz naturel », « Énergie verte »… avec une courte description.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {offers.map((offer, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <input
              type="text"
              className="form-input"
              value={offer.label}
              style={{ flex: '0 0 180px' }}
              placeholder="Intitulé"
              onChange={(e) => update(i, 'label', e.target.value)}
            />
            <input
              type="text"
              className="form-input"
              value={offer.description}
              style={{ flex: 1 }}
              placeholder="Description courte"
              onChange={(e) => update(i, 'description', e.target.value)}
            />
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onChange(offers.filter((_, idx) => idx !== i))}
              title="Supprimer cette offre"
              style={{ color: '#ef4444', padding: '0.45rem 0.6rem' }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-outline btn-sm" onClick={() => onChange([...offers, { label: '', description: '' }])} style={{ marginTop: '0.5rem' }}>
        + Ajouter une offre
      </button>
    </div>
  );
}

// Profils cibles : cases connues + ajout libre.
function ProfilesField({ profiles, onChange }) {
  const [custom, setCustom] = useState('');
  const customProfiles = profiles.filter((p) => !KNOWN_PROFILES.includes(p));

  function toggle(profile) {
    onChange(profiles.includes(profile) ? profiles.filter((p) => p !== profile) : [...profiles, profile]);
  }
  function addCustom() {
    const value = custom.trim();
    if (value && !profiles.includes(value)) onChange([...profiles, value]);
    setCustom('');
  }

  return (
    <div className="form-group">
      <label className="form-label">Profils cibles</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
        {KNOWN_PROFILES.map((profile) => (
          <label key={profile} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', cursor: 'pointer', padding: '0.3rem 0.6rem', border: '1px solid var(--color-border)', borderRadius: '999px', background: profiles.includes(profile) ? 'rgba(20,110,243,0.12)' : 'transparent' }}>
            <input type="checkbox" checked={profiles.includes(profile)} onChange={() => toggle(profile)} />
            {profile}
          </label>
        ))}
        {customProfiles.map((profile) => (
          <span key={profile} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', padding: '0.3rem 0.6rem', border: '1px solid var(--color-border)', borderRadius: '999px', background: 'rgba(20,110,243,0.12)' }}>
            {profile}
            <button type="button" onClick={() => toggle(profile)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}>✕</button>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          className="form-input"
          value={custom}
          placeholder="Autre profil…"
          style={{ maxWidth: '220px' }}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
        />
        <button type="button" className="btn btn-outline btn-sm" onClick={addCustom}>Ajouter</button>
      </div>
    </div>
  );
}

const EMPTY_FORM = {
  name: '',
  fullName: '',
  slug: '',
  tagline: '',
  category: CATEGORIES[0],
  logoUrl: '',
  description: [''],
  offers: [{ label: '', description: '' }],
  pros: [''],
  cons: [''],
  profiles: [],
  published: false,
};

export default function ProviderEditor() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { setIsAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [initial, setInitial] = useState({ slug: '', published: false });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [customCategory, setCustomCategory] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!isEdit) return;
    fetch('/api/admin/providers', { credentials: 'include' })
      .then((r) => {
        if (r.status === 401) {
          setIsAuthenticated(false);
          navigate('/admin/connexion');
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        const provider = (data.providers || []).find((p) => p.id === parseInt(id, 10));
        if (!provider) {
          setError('Fournisseur introuvable');
          return;
        }
        setForm({
          name: provider.name,
          fullName: provider.fullName,
          slug: provider.slug,
          tagline: provider.tagline,
          category: provider.category || CATEGORIES[0],
          logoUrl: provider.logoUrl,
          description: (provider.description || []).length ? provider.description : [''],
          offers: (provider.offers || []).length ? provider.offers : [{ label: '', description: '' }],
          pros: (provider.pros || []).length ? provider.pros : [''],
          cons: (provider.cons || []).length ? provider.cons : [''],
          profiles: provider.profiles || [],
          published: provider.published,
        });
        setInitial({ slug: provider.slug, published: provider.published });
        setCustomCategory(Boolean(provider.category) && !CATEGORIES.includes(provider.category));
        setSlugManuallyEdited(true);
      })
      .catch(() => setError('Erreur lors du chargement du fournisseur'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  function setField(name, value) {
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'name' && !slugManuallyEdited) updated.slug = slugify(value);
      return updated;
    });
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  }

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append('image', file);
    setUploadingLogo(true);
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', credentials: 'include', body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload échoué');
      setField('logoUrl', json.url);
    } catch (err) {
      setError(`Erreur upload : ${err.message}`);
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleSubmit(published) {
    setSaving(true);
    setError('');
    setFieldErrors({});
    try {
      const url = isEdit ? `/api/admin/providers/${id}` : '/api/admin/providers';
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...form, published }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 422 && data.errors) {
          const errs = {};
          data.errors.forEach((err) => { errs[err.path] = err.msg; });
          setFieldErrors(errs);
          setError('Certains champs sont invalides.');
        } else if (res.status === 401) {
          setIsAuthenticated(false);
          navigate('/admin/connexion');
        } else {
          setError(data.error || 'Erreur lors de la sauvegarde');
        }
      } else {
        navigate('/admin/fournisseurs');
      }
    } catch {
      setError('Erreur réseau');
    } finally {
      setSaving(false);
    }
  }

  const slugChanged = isEdit && initial.published && form.slug !== initial.slug;

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar onLogout={() => {}} />
        <main className="admin-main">
          <div className="loading-screen"><div className="spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }} /></div>
        </main>
      </div>
    );
  }

  return (
    <>
      <SEO title={isEdit ? 'Modifier le fournisseur | Admin' : 'Nouveau fournisseur | Admin'} noindex />
      <div className="admin-layout">
        <AdminSidebar onLogout={async () => {
          await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
          setIsAuthenticated(false);
          navigate('/admin/connexion');
        }} />
        <main className="admin-main">
          <div className="admin-topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/admin/fournisseurs" style={{ color: 'var(--color-text-muted)', display: 'flex' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </Link>
              <h1>{isEdit ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}</h1>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => handleSubmit(false)} disabled={saving || uploadingLogo}>
                Enregistrer en brouillon
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => handleSubmit(true)} disabled={saving || uploadingLogo}>
                {saving ? <><span className="spinner" /> Sauvegarde...</> : 'Publier'}
              </button>
            </div>
          </div>

          <div className="admin-content">
            {error && <div className="alert alert-error">{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
              {/* Colonne principale */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="admin-card">
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">
                      Nom <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input id="name" type="text" className="form-input" placeholder="Ex. EDF" value={form.name} onChange={(e) => setField('name', e.target.value)} required />
                    {fieldErrors.name && <p className="form-error">{fieldErrors.name}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="fullName">Nom complet</label>
                    <input id="fullName" type="text" className="form-input" placeholder="Ex. Électricité de France" value={form.fullName} onChange={(e) => setField('fullName', e.target.value)} />
                    {fieldErrors.fullName && <p className="form-error">{fieldErrors.fullName}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="tagline">Slogan</label>
                    <input id="tagline" type="text" className="form-input" placeholder="Une phrase qui résume le fournisseur" value={form.tagline} onChange={(e) => setField('tagline', e.target.value)} />
                    {fieldErrors.tagline && <p className="form-error">{fieldErrors.tagline}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="slug">Adresse de la fiche</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                      <span style={{ padding: '0.75rem 0.75rem 0.75rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                        /guide-energie/
                      </span>
                      <input
                        id="slug"
                        type="text"
                        style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', padding: '0.75rem 0.75rem 0.75rem 0' }}
                        value={form.slug}
                        onChange={(e) => { setSlugManuallyEdited(true); setField('slug', slugify(e.target.value)); }}
                      />
                    </div>
                    {slugChanged && (
                      <p style={{ fontSize: '0.78rem', color: '#f59e0b', marginTop: '0.4rem' }}>
                        ⚠️ Modifier l'adresse d'une fiche publiée change son URL : l'ancienne adresse renverra une page introuvable.
                      </p>
                    )}
                    {fieldErrors.slug && <p className="form-error">{fieldErrors.slug}</p>}
                  </div>
                </div>

                <div className="admin-card">
                  <ListField
                    label="Présentation"
                    hint="Un bloc par paragraphe. Texte simple, sans mise en forme."
                    items={form.description}
                    onChange={(v) => setField('description', v)}
                    placeholder="Paragraphe de présentation…"
                    addLabel="Ajouter un paragraphe"
                    multiline
                  />
                </div>

                <div className="admin-card">
                  <OffersField offers={form.offers} onChange={(v) => setField('offers', v)} />
                </div>

                <div className="admin-card">
                  <ListField
                    label="Points forts"
                    items={form.pros}
                    onChange={(v) => setField('pros', v)}
                    placeholder="Ex. Tarifs compétitifs sur le gaz"
                    addLabel="Ajouter un point fort"
                  />
                  <ListField
                    label="Points de vigilance"
                    items={form.cons}
                    onChange={(v) => setField('cons', v)}
                    placeholder="Ex. Service client difficile à joindre"
                    addLabel="Ajouter un point de vigilance"
                  />
                </div>

                <div className="admin-card">
                  <ProfilesField profiles={form.profiles} onChange={(v) => setField('profiles', v)} />
                </div>
              </div>

              {/* Colonne latérale */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="admin-card">
                  <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 700 }}>Publication</h3>
                  <div className="toggle-wrapper" style={{ marginBottom: '1.25rem' }}>
                    <label className="toggle" htmlFor="published">
                      <input id="published" type="checkbox" checked={form.published} onChange={(e) => setField('published', e.target.checked)} />
                      <span className="toggle-slider" />
                    </label>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                      {form.published ? 'Publié' : 'Masqué'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button className="btn btn-primary" onClick={() => handleSubmit(form.published)} disabled={saving || uploadingLogo} style={{ justifyContent: 'center' }}>
                      {saving ? <><span className="spinner" /> Sauvegarde...</> : 'Sauvegarder'}
                    </button>
                    <Link to="/admin/fournisseurs" className="btn btn-ghost" style={{ justifyContent: 'center', textAlign: 'center' }}>
                      Annuler
                    </Link>
                  </div>
                </div>

                <div className="admin-card">
                  <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 700 }}>Catégorie</h3>
                  <select
                    className="form-input"
                    value={customCategory ? '__autre__' : form.category}
                    onChange={(e) => {
                      if (e.target.value === '__autre__') {
                        setCustomCategory(true);
                        setField('category', '');
                      } else {
                        setCustomCategory(false);
                        setField('category', e.target.value);
                      }
                    }}
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    <option value="__autre__">Autre…</option>
                  </select>
                  {customCategory && (
                    <input
                      type="text"
                      className="form-input"
                      style={{ marginTop: '0.5rem' }}
                      placeholder="Nom de la catégorie"
                      value={form.category}
                      onChange={(e) => setField('category', e.target.value)}
                    />
                  )}
                  {fieldErrors.category && <p className="form-error">{fieldErrors.category}</p>}
                </div>

                <div className="admin-card">
                  <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 700 }}>Logo</h3>
                  {form.logoUrl ? (
                    <div className="upload-preview">
                      <img src={form.logoUrl} alt="Logo" style={{ width: '100%', maxHeight: '120px', objectFit: 'contain', background: '#fff', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem', padding: '0.5rem' }} />
                      <button className="upload-remove" onClick={() => setField('logoUrl', '')} title="Supprimer le logo">✕</button>
                    </div>
                  ) : (
                    <label className="upload-area" style={{ display: 'block', cursor: uploadingLogo ? 'wait' : 'pointer' }}>
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleLogoUpload} style={{ display: 'none' }} disabled={uploadingLogo} />
                      {uploadingLogo ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)' }}>
                          <div className="spinner" />
                          <span style={{ fontSize: '0.8rem' }}>Envoi en cours...</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                          <span style={{ fontSize: '0.8rem' }}>Cliquer pour télécharger</span>
                          <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>PNG avec fond transparent recommandé — max 5MB</span>
                        </div>
                      )}
                    </label>
                  )}
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.6rem' }}>
                    Sans logo, les initiales du fournisseur sont affichées automatiquement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .admin-content > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
