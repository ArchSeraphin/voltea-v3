import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App.jsx';
import { AdminSidebar } from './Dashboard.jsx';
import SEO from '../../components/SEO.jsx';

const EMPTY_FORM = {
  author_name: '',
  author_company: '',
  content: '',
  rating: 5,
  review_date: '',
  logo_url: '',
};

function StarRating({ value, onChange, readOnly }) {
  return (
    <div style={{ display: 'flex', gap: '0.15rem' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={star <= value ? '#facc15' : 'none'}
          stroke={star <= value ? '#facc15' : '#6b7280'}
          strokeWidth="2"
          style={{ cursor: readOnly ? 'default' : 'pointer' }}
          onClick={() => !readOnly && onChange(star)}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export default function Reviews() {
  const { setIsAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  async function apiFetch(url, opts = {}) {
    const res = await fetch(url, { credentials: 'include', ...opts });
    if (res.status === 401) {
      setIsAuthenticated(false);
      navigate('/admin/connexion');
      return null;
    }
    return res;
  }

  async function loadReviews() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/reviews');
      if (!res) return;
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadReviews(); }, []);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await apiFetch('/api/admin/upload', { method: 'POST', body: fd });
      if (!res) return;
      const data = await res.json();
      if (data.url) {
        setForm((prev) => ({ ...prev, logo_url: data.url }));
      }
    } catch {
      alert("Erreur lors de l'upload");
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/reviews/${editingId}` : '/api/admin/reviews';
      const method = editingId ? 'PUT' : 'POST';
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, rating: Number(form.rating) }),
      });
      if (!res) return;
      if (!res.ok) {
        const data = await res.json();
        alert(data.errors ? data.errors.map((e) => e.msg).join(', ') : 'Erreur');
        return;
      }
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      loadReviews();
    } catch {
      alert('Erreur réseau');
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(review) {
    setForm({
      author_name: review.author_name,
      author_company: review.author_company || '',
      content: review.content,
      rating: review.rating,
      review_date: review.review_date ? review.review_date.substring(0, 10) : '',
      logo_url: review.logo_url || '',
    });
    setEditingId(review.id);
    setShowForm(true);
  }

  async function handleDelete(id, name) {
    if (!confirm(`Supprimer l'avis de "${name}" ?`)) return;
    setActionLoading(id);
    try {
      await apiFetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert('Erreur lors de la suppression');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleToggle(id) {
    setActionLoading(id);
    try {
      const res = await apiFetch(`/api/admin/reviews/${id}/toggle`, { method: 'PATCH' });
      if (!res) return;
      const updated = await res.json();
      setReviews((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch {
      alert('Erreur');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setIsAuthenticated(false);
    navigate('/admin/connexion');
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return (
    <>
      <SEO title="Avis clients | Admin Voltea" noindex />
      <div className="admin-layout">
        <AdminSidebar onLogout={handleLogout} />
        <main className="admin-main">
          <div className="admin-topbar">
            <h1>Avis clients</h1>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setForm(EMPTY_FORM);
                setEditingId(null);
                setShowForm(true);
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Ajouter un avis
            </button>
          </div>

          <div className="admin-content">
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div className="admin-stat">
                <div className="admin-stat-number">{reviews.length}</div>
                <div className="admin-stat-label">Avis au total</div>
              </div>
              <div className="admin-stat">
                <div className="admin-stat-number">{reviews.filter((r) => r.visible).length}</div>
                <div className="admin-stat-label">Visibles</div>
              </div>
              <div className="admin-stat">
                <div className="admin-stat-number">
                  {reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—'}
                </div>
                <div className="admin-stat-label">Note moyenne</div>
              </div>
            </div>

            {/* Form modal */}
            {showForm && (
              <div className="admin-card" style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>
                  {editingId ? "Modifier l'avis" : 'Nouvel avis'}
                </h2>
                <form onSubmit={handleSubmit}>
                  <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="author_name">
                        Nom Prénom <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        id="author_name"
                        name="author_name"
                        type="text"
                        className="form-input"
                        value={form.author_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="author_company">Entreprise</label>
                      <input
                        id="author_company"
                        name="author_company"
                        type="text"
                        className="form-input"
                        value={form.author_company}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Note *</label>
                      <StarRating value={form.rating} onChange={(v) => setForm((p) => ({ ...p, rating: v }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="review_date">Date de l'avis</label>
                      <input
                        id="review_date"
                        name="review_date"
                        type="date"
                        className="form-input"
                        value={form.review_date}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" htmlFor="content">
                      Avis <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <textarea
                      id="content"
                      name="content"
                      className="form-textarea"
                      value={form.content}
                      onChange={handleChange}
                      required
                      rows={4}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Logo / Photo</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {form.logo_url && (
                        <img
                          src={form.logo_url}
                          alt="Logo"
                          style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
                        />
                      )}
                      <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
                        {uploadingLogo ? 'Upload...' : 'Choisir une image'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          style={{ display: 'none' }}
                        />
                      </label>
                      {form.logo_url && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setForm((p) => ({ ...p, logo_url: '' }))}
                        >
                          Retirer
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                      {saving ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Ajouter'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => { setShowForm(false); setEditingId(null); }}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Reviews list */}
            <div className="admin-card">
              <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Tous les avis</h2>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                  <div className="spinner" style={{ margin: '0 auto' }} />
                </div>
              ) : reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  <p>Aucun avis pour le moment.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Auteur</th>
                        <th>Avis</th>
                        <th>Note</th>
                        <th>Date</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((review) => (
                        <tr key={review.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              {review.logo_url ? (
                                <img
                                  src={review.logo_url}
                                  alt=""
                                  style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                                />
                              ) : (
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(20,110,243,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                  </svg>
                                </div>
                              )}
                              <div>
                                <p style={{ fontWeight: 600, color: 'white', margin: 0 }}>{review.author_name}</p>
                                {review.author_company && (
                                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>{review.author_company}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={{ maxWidth: '300px' }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {review.content}
                            </p>
                          </td>
                          <td>
                            <StarRating value={review.rating} readOnly />
                          </td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            {formatDate(review.review_date)}
                          </td>
                          <td>
                            <button
                              onClick={() => handleToggle(review.id)}
                              disabled={actionLoading === review.id}
                              className={`badge ${review.visible ? 'badge-green' : 'badge-gray'}`}
                              style={{ cursor: 'pointer', border: 'none', background: 'inherit' }}
                            >
                              {review.visible ? 'Visible' : 'Masqué'}
                            </button>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'nowrap' }}>
                              <button
                                onClick={() => handleEdit(review)}
                                className="btn btn-outline btn-sm"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                                Modifier
                              </button>
                              <button
                                onClick={() => handleDelete(review.id, review.author_name)}
                                disabled={actionLoading === review.id}
                                className="btn btn-sm"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                                  <path d="M10 11v6M14 11v6" />
                                  <path d="M9 6V4h6v2" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
