import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App.jsx';
import { AdminSidebar } from './Dashboard.jsx';
import SEO from '../../components/SEO.jsx';

const GA_REGEX = /^G-[A-Z0-9]+$/;

export default function Analytics() {
  const { setIsAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Google Analytics state
  const [gaId, setGaId] = useState('');
  const [savedGaId, setSavedGaId] = useState('');
  const [gaSaving, setGaSaving] = useState(false);
  const [gaSuccess, setGaSuccess] = useState(false);
  const [gaError, setGaError] = useState('');

  // GNews state
  const [gnewsKey, setGnewsKey] = useState('');
  const [savedGnewsKey, setSavedGnewsKey] = useState('');
  const [gnewsSaving, setGnewsSaving] = useState(false);
  const [gnewsSuccess, setGnewsSuccess] = useState(false);
  const [gnewsError, setGnewsError] = useState('');
  const [gnewsVisible, setGnewsVisible] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/settings', { credentials: 'include' })
      .then((r) => {
        if (r.status === 401) {
          setIsAuthenticated(false);
          navigate('/admin/connexion');
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) {
          const gaVal = data.ga_measurement_id || '';
          setGaId(gaVal);
          setSavedGaId(gaVal);
          const gnewsVal = data.gnews_api_key || '';
          setGnewsKey(gnewsVal);
          setSavedGnewsKey(gnewsVal);
        }
      })
      .catch(() => setGaError('Erreur lors du chargement'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveGA(e) {
    e.preventDefault();
    setGaError('');
    setGaSuccess(false);
    const trimmed = gaId.trim();
    if (trimmed && !GA_REGEX.test(trimmed)) {
      setGaError('Format invalide. Utilisez le format G-XXXXXXXXXX (ex: G-ABC123DEF4)');
      return;
    }
    setGaSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ key: 'ga_measurement_id', value: trimmed || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGaError(data.error || 'Erreur lors de la sauvegarde');
      } else {
        setSavedGaId(trimmed);
        setGaSuccess(true);
        setTimeout(() => setGaSuccess(false), 3000);
      }
    } catch {
      setGaError('Erreur réseau');
    } finally {
      setGaSaving(false);
    }
  }

  async function handleSaveGnews(e) {
    e.preventDefault();
    setGnewsError('');
    setGnewsSuccess(false);
    const trimmed = gnewsKey.trim();
    setGnewsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ key: 'gnews_api_key', value: trimmed || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGnewsError(data.error || 'Erreur lors de la sauvegarde');
      } else {
        setSavedGnewsKey(trimmed);
        setGnewsSuccess(true);
        setTimeout(() => setGnewsSuccess(false), 3000);
      }
    } catch {
      setGnewsError('Erreur réseau');
    } finally {
      setGnewsSaving(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setIsAuthenticated(false);
    navigate('/admin/connexion');
  }

  const gaActive = savedGaId && GA_REGEX.test(savedGaId);
  const gnewsActive = Boolean(savedGnewsKey);

  return (
    <>
      <SEO title="Paramètres & Intégrations | Admin Voltea" noindex />
      <div className="admin-layout">
        <AdminSidebar onLogout={handleLogout} />
        <main className="admin-main">
          <div className="admin-topbar">
            <h1>Paramètres &amp; Intégrations</h1>
          </div>

          <div className="admin-content" style={{ maxWidth: '600px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div className="spinner" style={{ margin: '0 auto' }} />
              </div>
            ) : (
              <>
                {/* ── Google Analytics ── */}
                <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Google Analytics 4</h2>
                    <span className={`badge ${gaActive ? 'badge-green' : 'badge-gray'}`}>
                      {gaActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                    {gaActive
                      ? `Mesure d'audience active avec l'ID : ${savedGaId}`
                      : "Aucun ID Google Analytics configuré."}
                  </p>
                  <form onSubmit={handleSaveGA}>
                    {gaSuccess && <div className="alert alert-success">Paramètres sauvegardés.</div>}
                    {gaError && <div className="alert alert-error">{gaError}</div>}
                    <div className="form-group">
                      <label className="form-label" htmlFor="gaId">ID de mesure Google Analytics 4</label>
                      <input
                        id="gaId"
                        type="text"
                        className="form-input"
                        placeholder="G-XXXXXXXXXX"
                        value={gaId}
                        onChange={(e) => { setGaId(e.target.value.toUpperCase()); setGaError(''); }}
                        pattern="^G-[A-Z0-9]+$|^$"
                      />
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.4rem' }}>
                        Format attendu : <code style={{ background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>G-XXXXXXXXXX</code>. Laissez vide pour désactiver.
                      </p>
                    </div>
                    <div style={{ background: 'rgba(20,110,243,0.06)', border: '1px solid rgba(20,110,243,0.2)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem', fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: '1.7' }}>
                      <strong style={{ color: 'var(--color-text)' }}>Important :</strong> GA ne sera chargé que si le visiteur a accepté les cookies (conforme RGPD/CNIL).
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={gaSaving} style={{ justifyContent: 'center' }}>
                      {gaSaving ? <><span className="spinner" /> Sauvegarde...</> : 'Sauvegarder'}
                    </button>
                  </form>
                </div>

                {/* ── GNews ── */}
                <div className="admin-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <h2 style={{ fontSize: '1.1rem', margin: 0 }}>GNews — Actualités marché</h2>
                    <span className={`badge ${gnewsActive ? 'badge-green' : 'badge-gray'}`}>
                      {gnewsActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                    {gnewsActive
                      ? "Flux d'actualités actif sur la page « Comprendre le marché »."
                      : "Aucune clé GNews configurée. La section actualités reste masquée."}
                  </p>
                  <form onSubmit={handleSaveGnews}>
                    {gnewsSuccess && <div className="alert alert-success">Clé GNews sauvegardée.</div>}
                    {gnewsError && <div className="alert alert-error">{gnewsError}</div>}
                    <div className="form-group">
                      <label className="form-label" htmlFor="gnewsKey">Clé API GNews</label>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          id="gnewsKey"
                          type={gnewsVisible ? 'text' : 'password'}
                          className="form-input"
                          placeholder="Votre clé API GNews"
                          value={gnewsKey}
                          onChange={(e) => { setGnewsKey(e.target.value); setGnewsError(''); }}
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => setGnewsVisible((v) => !v)}
                          style={{ flexShrink: 0 }}
                        >
                          {gnewsVisible ? 'Masquer' : 'Afficher'}
                        </button>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.4rem' }}>
                        Obtenez une clé gratuite sur{' '}
                        <a href="https://gnews.io" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>gnews.io</a>
                        {' '}(100 requêtes/jour en plan gratuit). Laissez vide pour désactiver.
                      </p>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={gnewsSaving} style={{ justifyContent: 'center' }}>
                      {gnewsSaving ? <><span className="spinner" /> Sauvegarde...</> : 'Sauvegarder la clé GNews'}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
