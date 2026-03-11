import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
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

const QUILL_MODULES = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    ['blockquote', 'code-block'],
    ['clean'],
  ],
};

const QUILL_FORMATS = [
  'header', 'bold', 'italic', 'underline',
  'list', 'bullet', 'link', 'image',
  'blockquote', 'code-block',
];

export default function ArticleEditor() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { setIsAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_image: '',
    published: false,
  });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [imagePreview, setImagePreview] = useState('');

  // Load article for edit mode
  useEffect(() => {
    if (!isEdit) return;
    fetch(`/api/admin/articles?page=1`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        const article = (data.articles || []).find((a) => a.id === parseInt(id, 10));
        if (article) {
          setForm({
            title: article.title || '',
            slug: article.slug || '',
            excerpt: article.excerpt || '',
            content: article.content || '',
            cover_image: article.cover_image || '',
            published: Boolean(article.published),
          });
          if (article.cover_image) setImagePreview(article.cover_image);
          setSlugManuallyEdited(true);
        }
      })
      .catch(() => setError('Erreur lors du chargement de l\'article'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setForm((prev) => {
      const updated = { ...prev, [name]: newValue };
      if (name === 'title' && !slugManuallyEdited) {
        updated.slug = slugify(value);
      }
      return updated;
    });
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function handleSlugChange(e) {
    setSlugManuallyEdited(true);
    setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }));
  }

  const handleContentChange = useCallback((value) => {
    setForm((prev) => ({ ...prev, content: value }));
  }, []);

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    setUploadingImage(true);
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        credentials: 'include',
        body: data,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      setForm((prev) => ({ ...prev, cover_image: json.url }));
      setImagePreview(json.url);
    } catch (err) {
      setError(`Erreur upload : ${err.message}`);
    } finally {
      setUploadingImage(false);
    }
  }

  function removeImage() {
    setForm((prev) => ({ ...prev, cover_image: '' }));
    setImagePreview('');
  }

  async function handleSubmit(published) {
    setSaving(true);
    setError('');
    setFieldErrors({});

    const payload = { ...form, published };

    try {
      const url = isEdit ? `/api/admin/articles/${id}` : '/api/admin/articles';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 422 && data.errors) {
          const errs = {};
          data.errors.forEach((err) => { errs[err.path] = err.msg; });
          setFieldErrors(errs);
        } else if (res.status === 401) {
          setIsAuthenticated(false);
          navigate('/admin/connexion');
        } else {
          setError(data.error || 'Erreur lors de la sauvegarde');
        }
      } else {
        navigate('/admin/tableau-de-bord');
      }
    } catch {
      setError('Erreur réseau');
    } finally {
      setSaving(false);
    }
  }

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
      <SEO title={isEdit ? 'Modifier l\'article | Admin' : 'Nouvel article | Admin'} noindex />
      <div className="admin-layout">
        <AdminSidebar onLogout={async () => {
          await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
          setIsAuthenticated(false);
          navigate('/admin/connexion');
        }} />
        <main className="admin-main">
          <div className="admin-topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/admin/tableau-de-bord" style={{ color: 'var(--color-text-muted)', display: 'flex' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </Link>
              <h1>{isEdit ? 'Modifier l\'article' : 'Nouvel article'}</h1>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => handleSubmit(false)}
                disabled={saving}
              >
                Enregistrer brouillon
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleSubmit(true)}
                disabled={saving}
              >
                {saving ? <><span className="spinner" /> Sauvegarde...</> : 'Publier'}
              </button>
            </div>
          </div>

          <div className="admin-content">
            {error && <div className="alert alert-error">{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
              {/* Main content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="admin-card">
                  <div className="form-group">
                    <label className="form-label" htmlFor="title">
                      Titre <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      className="form-input"
                      placeholder="Titre de l'article"
                      value={form.title}
                      onChange={handleChange}
                      required
                    />
                    {fieldErrors.title && <p className="form-error">{fieldErrors.title}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="slug">Slug URL</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                      <span style={{ padding: '0.75rem 0.75rem 0.75rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                        /actualites/
                      </span>
                      <input
                        id="slug"
                        name="slug"
                        type="text"
                        style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', padding: '0.75rem 0.75rem 0.75rem 0' }}
                        value={form.slug}
                        onChange={handleSlugChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="excerpt">Extrait</label>
                    <textarea
                      id="excerpt"
                      name="excerpt"
                      className="form-textarea"
                      placeholder="Résumé court de l'article (affiché dans les listings)"
                      value={form.excerpt}
                      onChange={handleChange}
                      rows={3}
                      style={{ minHeight: '80px' }}
                    />
                  </div>
                </div>

                <div className="admin-card">
                  <label className="form-label">Contenu</label>
                  <ReactQuill
                    theme="snow"
                    value={form.content}
                    onChange={handleContentChange}
                    modules={QUILL_MODULES}
                    formats={QUILL_FORMATS}
                    placeholder="Rédigez votre article ici..."
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="admin-card">
                  <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 700 }}>Publication</h3>

                  <div className="toggle-wrapper" style={{ marginBottom: '1.25rem' }}>
                    <label className="toggle" htmlFor="published">
                      <input
                        id="published"
                        name="published"
                        type="checkbox"
                        checked={form.published}
                        onChange={handleChange}
                      />
                      <span className="toggle-slider" />
                    </label>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                      {form.published ? 'Publié' : 'Brouillon'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleSubmit(form.published)}
                      disabled={saving}
                      style={{ justifyContent: 'center' }}
                    >
                      {saving ? <><span className="spinner" /> Sauvegarde...</> : 'Sauvegarder'}
                    </button>
                    <Link to="/admin/tableau-de-bord" className="btn btn-ghost" style={{ justifyContent: 'center', textAlign: 'center' }}>
                      Annuler
                    </Link>
                  </div>
                </div>

                <div className="admin-card">
                  <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 700 }}>Image de couverture</h3>

                  {imagePreview ? (
                    <div className="upload-preview">
                      <img src={imagePreview} alt="Couverture" style={{ width: '100%', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem', maxHeight: '160px', objectFit: 'cover' }} />
                      <button className="upload-remove" onClick={removeImage} title="Supprimer l'image">✕</button>
                    </div>
                  ) : (
                    <label className="upload-area" style={{ display: 'block', cursor: uploadingImage ? 'wait' : 'pointer' }}>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                        disabled={uploadingImage}
                      />
                      {uploadingImage ? (
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
                          <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>JPG, PNG, WebP — max 5MB</span>
                        </div>
                      )}
                    </label>
                  )}
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
