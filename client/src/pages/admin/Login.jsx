import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App.jsx';
import SEO from '../../components/SEO.jsx';

export default function Login() {
  const { setIsAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setError('Trop de tentatives. Réessayez dans 15 minutes.');
        } else {
          setError(data.error || 'Identifiants invalides.');
        }
      } else {
        setIsAuthenticated(true);
        navigate('/admin/tableau-de-bord', { replace: true });
      }
    } catch {
      setError('Erreur réseau. Veuillez vérifier votre connexion.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SEO title="Administration | Voltea Énergie" noindex />
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0f1a', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <img src="/img/logo/logo-clair.png" alt="Voltea Énergie" style={{ height: '36px', margin: '0 auto 1.5rem' }} />
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Administration</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Connectez-vous pour accéder au tableau de bord</p>
          </div>

          <div className="admin-card">
            {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Adresse email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="admin@voltea-energie.fr"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">Mot de passe</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
              >
                {loading ? (
                  <>
                    <span className="spinner" /> Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            <a href="/" style={{ color: 'var(--color-primary)' }}>← Retour au site</a>
          </p>
        </div>
      </div>
    </>
  );
}
