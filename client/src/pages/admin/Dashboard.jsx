import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App.jsx';
import SEO from '../../components/SEO.jsx';

function AdminSidebar({ onLogout }) {
  const navItems = [
    {
      to: '/admin/tableau-de-bord',
      label: 'Tableau de bord',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
      ),
    },
    {
      to: '/admin/articles/nouveau',
      label: 'Nouvel article',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      ),
    },
    {
      to: '/admin/analytics',
      label: 'Analytics',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      ),
    },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <img src="/img/logo/logo-clair.png" alt="Voltea Énergie" />
      </div>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end
          className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
      <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
        <a href="/" className="admin-nav-link" style={{ marginBottom: '0.25rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Voir le site
        </a>
        <button onClick={onLogout} className="admin-nav-link" style={{ color: '#ef4444' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Déconnexion
        </button>
      </div>
    </aside>
  );
}

export { AdminSidebar };

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Dashboard() {
  const { setIsAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  async function loadArticles(page = 1) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/articles?page=${page}`, { credentials: 'include' });
      if (res.status === 401) {
        setIsAuthenticated(false);
        navigate('/admin/connexion');
        return;
      }
      const data = await res.json();
      setArticles(data.articles || []);
      setPagination(data.pagination || null);
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadArticles();
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setIsAuthenticated(false);
    navigate('/admin/connexion');
  }

  async function handleDelete(id, title) {
    if (!confirm(`Supprimer l'article "${title}" ?`)) return;
    setActionLoading(id);
    try {
      await fetch(`/api/admin/articles/${id}`, { method: 'DELETE', credentials: 'include' });
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert('Erreur lors de la suppression');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleToggle(id) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/articles/${id}/toggle`, {
        method: 'PATCH',
        credentials: 'include',
      });
      const updated = await res.json();
      setArticles((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch {
      alert('Erreur');
    } finally {
      setActionLoading(null);
    }
  }

  const totalArticles = pagination ? pagination.total : articles.length;
  const publishedCount = articles.filter((a) => a.published).length;

  return (
    <>
      <SEO title="Tableau de bord | Admin Voltea" noindex />
      <div className="admin-layout">
        <AdminSidebar onLogout={handleLogout} />
        <main className="admin-main">
          <div className="admin-topbar">
            <h1>Tableau de bord</h1>
            <Link to="/admin/articles/nouveau" className="btn btn-primary btn-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Nouvel article
            </Link>
          </div>

          <div className="admin-content">
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div className="admin-stat">
                <div className="admin-stat-number">{totalArticles}</div>
                <div className="admin-stat-label">Articles au total</div>
              </div>
              <div className="admin-stat">
                <div className="admin-stat-number">{publishedCount}</div>
                <div className="admin-stat-label">Publiés</div>
              </div>
              <div className="admin-stat">
                <div className="admin-stat-number">{totalArticles - publishedCount}</div>
                <div className="admin-stat-label">Brouillons</div>
              </div>
            </div>

            {/* Articles table */}
            <div className="admin-card">
              <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Articles récents</h2>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                  <div className="spinner" style={{ margin: '0 auto' }} />
                </div>
              ) : articles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  <p>Aucun article. <Link to="/admin/articles/nouveau" style={{ color: 'var(--color-primary)' }}>Créez le premier !</Link></p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Titre</th>
                        <th>Statut</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {articles.map((article) => (
                        <tr key={article.id}>
                          <td style={{ maxWidth: '300px' }}>
                            <p style={{ fontWeight: 600, color: 'white', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {article.title}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
                              /{article.slug}
                            </p>
                          </td>
                          <td>
                            <button
                              onClick={() => handleToggle(article.id)}
                              disabled={actionLoading === article.id}
                              className={`badge ${article.published ? 'badge-green' : 'badge-gray'}`}
                              style={{ cursor: 'pointer', border: 'none', background: 'inherit' }}
                              title="Cliquer pour changer le statut"
                            >
                              {article.published ? 'Publié' : 'Brouillon'}
                            </button>
                          </td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            {formatDate(article.published_at || article.created_at)}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'nowrap' }}>
                              {article.published && (
                                <a
                                  href={`/actualites/${article.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-ghost btn-sm"
                                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                                  title="Voir"
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                </a>
                              )}
                              <Link
                                to={`/admin/articles/${article.id}/modifier`}
                                className="btn btn-outline btn-sm"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                Modifier
                              </Link>
                              <button
                                onClick={() => handleDelete(article.id, article.title)}
                                disabled={actionLoading === article.id}
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
