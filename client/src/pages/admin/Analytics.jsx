import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App.jsx';
import { AdminSidebar } from './Dashboard.jsx';
import SEO from '../../components/SEO.jsx';

const GA_REGEX = /^G-[A-Z0-9]+$/;

export default function Analytics() {
  const { setIsAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [gaId, setGaId] = useState('');
  const [savedGaId, setSavedGaId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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
          const val = data.ga_measurement_id || '';
          setGaId(val);
          setSavedGaId(val);
        }
      })
      .catch(() => setError('Erreur lors du chargement'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const trimmed = gaId.trim();

    if (trimmed && !GA_REGEX.test(trimmed)) {
      setError('Format invalide. Utilisez le format G-XXXXXXXXXX (ex: G-ABC123DEF4)');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ key: 'ga_measurement_id', value: trimmed || null }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erreur lors de la sauvegarde');
      } else {
        setSavedGaId(trimmed);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch {
      setError('Erreur réseau');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setIsAuthenticated(false);
    navigate('/admin/connexion');
  }

  const isActive = savedGaId && GA_REGEX.test(savedGaId);

  return (
    <>
      <SEO title="Analytics | Admin Voltea" noindex />
      <div className="admin-layout">
        <AdminSidebar onLogout={handleLogout} />
        <main className="admin-main">
          <div className="admin-topbar">
            <h1>Paramètres Analytics</h1>
          </div>

          <div className="admin-content" style={{ maxWidth: '600px' }}>
            <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Google Analytics 4</h2>
                <span className={`badge ${isActive ? 'badge-green' : 'badge-gray'}`}>
                  {isActive ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0' }}>
                {isActive
                  ? `Mesure d'audience active avec l'ID : ${savedGaId}`
                  : 'Aucun ID Google Analytics configuré. La mesure d\'audience est désactivée.'}
              </p>
            </div>

            <div className="admin-card">
              <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Configurer Google Analytics</h3>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="spinner" style={{ margin: '0 auto' }} />
                </div>
              ) : (
                <form onSubmit={handleSave}>
                  {success && (
                    <div className="alert alert-success">Paramètres sauvegardés avec succès.</div>
                  )}
                  {error && <div className="alert alert-error">{error}</div>}

                  <div className="form-group">
                    <label className="form-label" htmlFor="gaId">
                      ID de mesure Google Analytics 4
                    </label>
                    <input
                      id="gaId"
                      type="text"
                      className="form-input"
                      placeholder="G-XXXXXXXXXX"
                      value={gaId}
                      onChange={(e) => {
                        setGaId(e.target.value.toUpperCase());
                        setError('');
                      }}
                      pattern="^G-[A-Z0-9]+$|^$"
                    />
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.4rem' }}>
                      Format attendu : <code style={{ background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>G-XXXXXXXXXX</code>.
                      Laissez vide pour désactiver Google Analytics.
                    </p>
                  </div>

                  <div style={{ background: 'rgba(20,110,243,0.06)', border: '1px solid rgba(20,110,243,0.2)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem', fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: '1.7' }}>
                    <strong style={{ color: 'var(--color-text)' }}>Important :</strong> Google Analytics ne sera chargé
                    que si le visiteur a accepté les cookies via la bannière de consentement.
                    Cela est conforme au RGPD et aux recommandations de la CNIL.
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                    style={{ justifyContent: 'center' }}
                  >
                    {saving ? <><span className="spinner" /> Sauvegarde...</> : 'Sauvegarder les paramètres'}
                  </button>
                </form>
              )}
            </div>

            <div className="admin-card" style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>Comment trouver votre ID ?</h3>
              <ol style={{ paddingLeft: '1.25rem', lineHeight: '2', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                <li>Connectez-vous à <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>Google Analytics</a></li>
                <li>Sélectionnez votre propriété</li>
                <li>Allez dans Admin → Flux de données</li>
                <li>Cliquez sur votre flux Web</li>
                <li>Copiez l'ID de mesure (commence par G-)</li>
              </ol>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
