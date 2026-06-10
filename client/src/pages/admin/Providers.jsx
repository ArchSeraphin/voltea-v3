import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App.jsx';
import { AdminSidebar } from './Dashboard.jsx';
import SEO from '../../components/SEO.jsx';

// Bandeau d'état de la régénération SEO (file src/services/prerenderService.js).
function PrerenderBanner() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    let active = true;
    async function poll() {
      try {
        const res = await fetch('/api/admin/prerender/status', { credentials: 'include' });
        if (res.ok && active) setStatus(await res.json());
      } catch { /* silencieux : le bandeau est informatif */ }
    }
    poll();
    const timer = setInterval(poll, 3000);
    return () => { active = false; clearInterval(timer); };
  }, []);

  if (!status) return null;
  if (status.running || (status.pending && status.pending.length > 0)) {
    return (
      <div className="alert" style={{ background: 'rgba(20,110,243,0.08)', border: '1px solid rgba(20,110,243,0.3)', color: 'var(--color-primary)' }}>
        ⏳ Régénération des pages en cours… Les modifications seront visibles par Google dans quelques instants.
      </div>
    );
  }
  if (status.lastRun?.state === 'error') {
    return (
      <div className="alert alert-error">
        ⚠️ La régénération SEO a échoué. Les fiches restent visibles sur le site ; réenregistrez pour réessayer. Détail : {status.lastRun.error}
      </div>
    );
  }
  if (status.lastRun?.state === 'done') {
    return (
      <div className="alert" style={{ background: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.3)', color: '#27ae60' }}>
        ✓ Pages à jour ({status.lastRun.routes.join(', ')})
      </div>
    );
  }
  return null;
}

export default function Providers() {
  const { setIsAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  async function loadProviders(isActive = () => true) {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/providers', { credentials: 'include' });
      if (res.status === 401) {
        setIsAuthenticated(false);
        navigate('/admin/connexion');
        return;
      }
      const data = await res.json();
      if (!isActive()) return;
      setProviders(data.providers || []);
    } catch {
      if (!isActive()) return;
      setProviders([]);
    } finally {
      if (isActive()) setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    loadProviders(() => active);
    return () => { active = false; };
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setIsAuthenticated(false);
    navigate('/admin/connexion');
  }

  async function handleToggle(id) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/providers/${id}/toggle`, { method: 'PATCH', credentials: 'include' });
      if (res.status === 401) {
        setIsAuthenticated(false);
        navigate('/admin/connexion');
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();
      setProviders((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch {
      alert('Erreur lors du changement de statut');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Supprimer définitivement la fiche "${name}" ? Sa page ne sera plus accessible sur le site.`)) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/providers/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.status === 401) {
        setIsAuthenticated(false);
        navigate('/admin/connexion');
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setProviders((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert('Erreur lors de la suppression');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleMove(index, direction) {
    if (actionLoading) return;
    const target = index + direction;
    if (target < 0 || target >= providers.length) return;
    const next = [...providers];
    [next[index], next[target]] = [next[target], next[index]];
    setActionLoading('reorder');
    setProviders(next);
    try {
      const res = await fetch('/api/admin/providers/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids: next.map((p) => p.id) }),
      });
      if (!res.ok) throw new Error();
    } catch {
      alert("Erreur lors du réordonnancement");
      loadProviders();
    } finally {
      setActionLoading(null);
    }
  }

  const publishedCount = providers.filter((p) => p.published).length;

  return (
    <>
      <SEO title="Fournisseurs | Admin Voltea" noindex />
      <div className="admin-layout">
        <AdminSidebar onLogout={handleLogout} />
        <main className="admin-main">
          <div className="admin-topbar">
            <h1>Fournisseurs</h1>
            <Link to="/admin/fournisseurs/nouveau" className="btn btn-primary btn-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Nouveau fournisseur
            </Link>
          </div>

          <div className="admin-content">
            <PrerenderBanner />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div className="admin-stat">
                <div className="admin-stat-number">{providers.length}</div>
                <div className="admin-stat-label">Fournisseurs au total</div>
              </div>
              <div className="admin-stat">
                <div className="admin-stat-number">{publishedCount}</div>
                <div className="admin-stat-label">Publiés</div>
              </div>
              <div className="admin-stat">
                <div className="admin-stat-number">{providers.length - publishedCount}</div>
                <div className="admin-stat-label">Masqués</div>
              </div>
            </div>

            <div className="admin-card">
              <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Tous les fournisseurs</h2>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="spinner" style={{ margin: '0 auto' }} />
                </div>
              ) : providers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  <p>Aucun fournisseur. <Link to="/admin/fournisseurs/nouveau" style={{ color: 'var(--color-primary)' }}>Créez le premier !</Link></p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Ordre</th>
                        <th>Fournisseur</th>
                        <th>Catégorie</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {providers.map((provider, index) => (
                        <tr key={provider.id}>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <button onClick={() => handleMove(index, -1)} disabled={index === 0 || actionLoading !== null} className="btn btn-ghost btn-sm" style={{ padding: '0.2rem 0.45rem' }} title="Monter">↑</button>
                            <button onClick={() => handleMove(index, 1)} disabled={index === providers.length - 1 || actionLoading !== null} className="btn btn-ghost btn-sm" style={{ padding: '0.2rem 0.45rem' }} title="Descendre">↓</button>
                          </td>
                          <td style={{ maxWidth: '280px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              {provider.logoUrl ? (
                                <img src={provider.logoUrl} alt="" style={{ height: '28px', maxWidth: '70px', objectFit: 'contain', background: '#fff', borderRadius: '4px', padding: '2px' }} />
                              ) : (
                                <span style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--color-primary)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
                                  {provider.name.slice(0, 2).toUpperCase()}
                                </span>
                              )}
                              <div>
                                <p style={{ fontWeight: 600, color: 'white', margin: 0 }}>{provider.name}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>/guide-energie/{provider.slug}</p>
                              </div>
                            </div>
                          </td>
                          <td>{provider.category || '—'}</td>
                          <td>
                            <button
                              onClick={() => handleToggle(provider.id)}
                              disabled={actionLoading === provider.id}
                              className={`badge ${provider.published ? 'badge-green' : 'badge-gray'}`}
                              style={{ cursor: 'pointer', border: 'none', background: 'inherit' }}
                              title="Cliquer pour changer le statut"
                            >
                              {provider.published ? 'Publié' : 'Masqué'}
                            </button>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'nowrap' }}>
                              {provider.published && (
                                <a href={`/guide-energie/${provider.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }} title="Voir la fiche">
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                </a>
                              )}
                              <Link to={`/admin/fournisseurs/${provider.id}/modifier`} className="btn btn-outline btn-sm" style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                Modifier
                              </Link>
                              <button
                                onClick={() => handleDelete(provider.id, provider.name)}
                                disabled={actionLoading === provider.id}
                                className="btn btn-sm"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
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
