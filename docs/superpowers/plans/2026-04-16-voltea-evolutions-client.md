# Voltea v3 — Évolutions client Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Supprimer toutes les références aux collectivités, ajouter une page "Comprendre le marché" avec flux GNews, et créer un guide des fournisseurs d'énergie avec fiches individuelles.

**Architecture:** Proxy Express pour GNews (clé en base, cache mémoire 15 min, jamais exposée au client) ; guide fournisseurs en données statiques React ; clé GNews gérée dans le panneau admin existant (pattern identique à GA). Requires Node.js 18+ for built-in `fetch`.

**Tech Stack:** React 18, React Router v6, Express 4, MySQL2, CSS classes existantes du projet.

---

## File Map

### Fichiers créés
- `src/controllers/newsController.js` — proxy GNews avec cache mémoire
- `client/src/data/providersData.js` — données statiques des 8 fournisseurs
- `client/src/pages/MarketPage.jsx` — page `/marche-energie`
- `client/src/pages/GuideIndex.jsx` — index `/guide-energie`
- `client/src/pages/ProviderPage.jsx` — fiche `/guide-energie/:slug`

### Fichiers modifiés
- `client/src/components/Header.jsx` — nav : suppression Collectivités, ajout Comprendre le marché
- `client/src/App.jsx` — routes, imports, JSON-LD schema
- `client/src/pages/Home.jsx` — suppression textes collectivités + section GNews preview
- `src/controllers/settingsController.js` — ajout `gnews_api_key` aux clés admin
- `src/routes/api.js` — ajout route `GET /api/news`
- `client/src/pages/admin/Analytics.jsx` — ajout section clé GNews

---

## Task 1 : Suppression "Collectivités"

**Files:**
- Modify: `client/src/components/Header.jsx`
- Modify: `client/src/App.jsx`
- Modify: `client/src/pages/Home.jsx`

- [ ] **Step 1 : Retirer Collectivités du Header**

Dans `client/src/components/Header.jsx`, remplacer le tableau `NAV_LINKS` :

```jsx
const NAV_LINKS = [
  { to: '/a-propos', label: 'Qui sommes nous' },
  { to: '/services', label: 'Nos services' },
  { to: '/actualites', label: 'Actus' },
];
```

- [ ] **Step 2 : Mettre à jour App.jsx**

Supprimer la ligne d'import :
```js
// Supprimer :
import Collectivites from './pages/Collectivites.jsx';
```

Supprimer la route :
```jsx
// Supprimer :
<Route path="/collectivites" element={<Collectivites />} />
```

Mettre à jour le schema JSON-LD (ligne ~72) :
```js
description: 'Courtier en énergie pour professionnels à Bourgoin-Jallieu',
```

- [ ] **Step 3 : Mettre à jour Home.jsx**

Remplacer la description SEO (ligne ~58) :
```jsx
description="Voltea Énergie, courtier en énergie indépendant à Bourgoin-Jallieu. Négociation de contrats d'électricité et de gaz pour professionnels en Isère. Audit sans frais."
```

Remplacer le texte section "Reprenez le contrôle" (ligne ~119) :
```jsx
<p>
  Courtier expert en électricité et gaz naturel pour les entreprises
  et copropriétés en Isère. Basés à Bourgoin-Jallieu, nous négocions pour vous les
  meilleures offres du marché.
</p>
```

- [ ] **Step 4 : Vérifier**

Démarrer le serveur dev :
```bash
cd client && npm run dev
```

Vérifier que :
- Le lien "Collectivités" n'apparaît plus dans la nav
- `/collectivites` renvoie une 404 (page NotFound)
- La Home ne mentionne plus "collectivités"

- [ ] **Step 5 : Commit**

```bash
git add client/src/components/Header.jsx client/src/App.jsx client/src/pages/Home.jsx
git commit -m "feat: remove collectivités references from nav, routes, SEO and copy"
```

---

## Task 2 : Navigation "Comprendre le marché" + MarketPage skeleton

**Files:**
- Modify: `client/src/components/Header.jsx`
- Create: `client/src/pages/MarketPage.jsx`
- Modify: `client/src/App.jsx`

- [ ] **Step 1 : Ajouter le lien dans Header.jsx**

Remplacer `NAV_LINKS` (celui de la Task 1) :
```jsx
const NAV_LINKS = [
  { to: '/a-propos', label: 'Qui sommes nous' },
  { to: '/services', label: 'Nos services' },
  { to: '/marche-energie', label: 'Comprendre le marché' },
  { to: '/actualites', label: 'Actus' },
];
```

- [ ] **Step 2 : Créer MarketPage.jsx (skeleton)**

Créer `client/src/pages/MarketPage.jsx` :
```jsx
import React from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import SEO from '../components/SEO.jsx';

export default function MarketPage() {
  return (
    <>
      <SEO
        title="Comprendre le marché de l'énergie | Voltea Énergie"
        description="Actualités du marché de l'énergie et guide des fournisseurs. Restez informé des évolutions des prix du gaz et de l'électricité en France."
        canonical="/marche-energie"
      />
      <Header />
      <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Page en cours de construction…</p>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 3 : Ajouter la route dans App.jsx**

Ajouter l'import en haut du fichier, après les imports existants de pages :
```jsx
import MarketPage from './pages/MarketPage.jsx';
```

Ajouter la route dans `<Routes>`, après la route `/services` :
```jsx
<Route path="/marche-energie" element={<MarketPage />} />
```

- [ ] **Step 4 : Vérifier**

Naviguer vers `http://localhost:5173/marche-energie`.
Attendu : page s'affiche avec header/footer, texte "en cours de construction".
Le lien "Comprendre le marché" est visible dans la nav desktop et mobile.

- [ ] **Step 5 : Commit**

```bash
git add client/src/components/Header.jsx client/src/pages/MarketPage.jsx client/src/App.jsx
git commit -m "feat: add 'Comprendre le marché' nav link and MarketPage skeleton"
```

---

## Task 3 : Backend GNews proxy

**Files:**
- Modify: `src/controllers/settingsController.js`
- Create: `src/controllers/newsController.js`
- Modify: `src/routes/api.js`

- [ ] **Step 1 : Mettre à jour settingsController.js**

Remplacer le contenu complet de `src/controllers/settingsController.js` :

```js
'use strict';

const pool = require('../config/database');

// Keys returned by the public /api/settings endpoint
const PUBLIC_KEYS = ['ga_measurement_id'];

// Keys accessible and updateable via the admin /api/admin/settings endpoint
const ALLOWED_KEYS = ['ga_measurement_id', 'gnews_api_key'];

async function getPublicSettings(req, res) {
  try {
    const placeholders = PUBLIC_KEYS.map(() => '?').join(', ');
    const [rows] = await pool.execute(
      `SELECT \`key\`, \`value\` FROM settings WHERE \`key\` IN (${placeholders})`,
      PUBLIC_KEYS
    );
    const settings = {};
    rows.forEach((row) => {
      settings[row.key] = row.value;
    });
    return res.json(settings);
  } catch (err) {
    console.error('[settings/getPublicSettings]', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function getSettings(req, res) {
  try {
    const placeholders = ALLOWED_KEYS.map(() => '?').join(', ');
    const [rows] = await pool.execute(
      `SELECT \`key\`, \`value\` FROM settings WHERE \`key\` IN (${placeholders})`,
      ALLOWED_KEYS
    );
    const settings = {};
    ALLOWED_KEYS.forEach((k) => (settings[k] = null));
    rows.forEach((row) => {
      settings[row.key] = row.value;
    });
    return res.json(settings);
  } catch (err) {
    console.error('[settings/getSettings]', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function updateSettings(req, res) {
  const { key, value } = req.body;

  if (!key || !ALLOWED_KEYS.includes(key)) {
    return res.status(400).json({ error: 'Clé de paramètre invalide' });
  }

  if (key === 'ga_measurement_id' && value && !/^G-[A-Z0-9]+$/.test(value)) {
    return res.status(400).json({ error: 'Format GA invalide. Utilisez le format G-XXXXXXXXXX' });
  }

  try {
    if (value === null || value === '') {
      await pool.execute('DELETE FROM settings WHERE `key` = ?', [key]);
    } else {
      await pool.execute(
        'INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?',
        [key, value, value]
      );
    }
    return res.json({ success: true, key, value: value || null });
  } catch (err) {
    console.error('[settings/updateSettings]', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = { getPublicSettings, getSettings, updateSettings };
```

- [ ] **Step 2 : Créer newsController.js**

Créer `src/controllers/newsController.js` :

```js
'use strict';

const pool = require('../config/database');

// In-memory cache — one entry, invalidated after 15 minutes or server restart
let cache = { data: null, timestamp: 0 };
const CACHE_TTL_MS = 15 * 60 * 1000;

async function getGNewsApiKey() {
  const [rows] = await pool.execute(
    "SELECT `value` FROM settings WHERE `key` = 'gnews_api_key' LIMIT 1"
  );
  return rows.length > 0 ? rows[0].value : null;
}

async function getNews(req, res) {
  try {
    const now = Date.now();

    // Serve from cache if still fresh
    if (cache.data && now - cache.timestamp < CACHE_TTL_MS) {
      return res.json(cache.data);
    }

    const apiKey = await getGNewsApiKey();
    if (!apiKey) {
      return res.json({ articles: [] });
    }

    const maxRaw = parseInt(req.query.max, 10);
    const max = Number.isFinite(maxRaw) && maxRaw > 0 ? Math.min(maxRaw, 10) : 9;
    const q = encodeURIComponent('marché énergie OR courtage énergie OR électricité gaz');
    const url = `https://gnews.io/api/v4/search?q=${q}&lang=fr&max=${max}&token=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error('[news/getNews] GNews responded with status', response.status);
      return res.json({ articles: [] });
    }

    const data = await response.json();
    cache = { data, timestamp: now };
    return res.json(data);
  } catch (err) {
    console.error('[news/getNews]', err);
    return res.json({ articles: [] });
  }
}

module.exports = { getNews };
```

- [ ] **Step 3 : Ajouter la route dans api.js**

Dans `src/routes/api.js`, ajouter l'import après les imports existants :
```js
const newsController = require('../controllers/newsController');
```

Ajouter la route après la route `/reviews` :
```js
// News (GNews proxy)
router.get('/news', apiLimiter, newsController.getNews);
```

- [ ] **Step 4 : Tester le endpoint**

Démarrer le serveur backend :
```bash
node app.js
```

Tester sans clé API configurée (réponse attendue : `{"articles":[]}`):
```bash
curl http://localhost:3000/api/news
```

Attendu : `{"articles":[]}` — aucune erreur 500.

- [ ] **Step 5 : Commit**

```bash
git add src/controllers/settingsController.js src/controllers/newsController.js src/routes/api.js
git commit -m "feat: add GNews proxy endpoint with in-memory cache and admin key support"
```

---

## Task 4 : Admin panel — clé API GNews

**Files:**
- Modify: `client/src/pages/admin/Analytics.jsx`

- [ ] **Step 1 : Mettre à jour Analytics.jsx**

Remplacer le contenu complet de `client/src/pages/admin/Analytics.jsx` :

```jsx
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
```

- [ ] **Step 2 : Vérifier dans le navigateur**

Naviguer vers `http://localhost:5173/admin/connexion`, se connecter, aller sur "Analytics".
Vérifier :
- Le titre affiche "Paramètres & Intégrations"
- Le champ GNews apparaît avec badge "Inactif"
- Le bouton Afficher/Masquer fonctionne
- Enregistrer une clé test → badge passe à "Actif" après rechargement

- [ ] **Step 3 : Commit**

```bash
git add client/src/pages/admin/Analytics.jsx
git commit -m "feat: add GNews API key field in admin settings panel"
```

---

## Task 5 : Home.jsx — section actualités marché

**Files:**
- Modify: `client/src/pages/Home.jsx`

- [ ] **Step 1 : Ajouter le state et le fetch GNews**

Dans `Home.jsx`, modifier la section imports/state. Après `import ScrollReveal` :
```jsx
import { Link } from 'react-router-dom';
// (déjà présent)
```

Dans la fonction `Home`, ajouter le state GNews après les states existants :
```jsx
const [gnewsArticles, setGnewsArticles] = useState([]);
```

Dans le `useEffect` existant, ajouter le fetch GNews :
```jsx
useEffect(() => {
  fetch('/api/articles?page=1')
    .then((r) => r.json())
    .then((data) => setArticles((data.articles || []).slice(0, 3)))
    .catch(() => {});
  fetch('/api/reviews')
    .then((r) => r.json())
    .then((data) => setReviews(data.reviews || []))
    .catch(() => {});
  fetch('/api/news?max=3')
    .then((r) => r.json())
    .then((data) => setGnewsArticles(data.articles || []))
    .catch(() => {});
}, []);
```

- [ ] **Step 2 : Ajouter la section GNews dans le JSX**

Insérer la section suivante juste avant la section CTA finale (`{/* ── CTA ── */}`) :

```jsx
{/* ── ACTUALITÉS MARCHÉ ── */}
{gnewsArticles.length > 0 && (
  <section className="section section--light">
    <div className="container">
      <ScrollReveal>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
          <div>
            <span className="section-label">Marché de l'énergie</span>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Actualités énergétiques</h2>
          </div>
          <Link to="/marche-energie" className="btn btn-outline btn-sm">
            Voir toutes les actualités
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </ScrollReveal>
      <div className="news-grid">
        {gnewsArticles.map((article, i) => (
          <ScrollReveal key={article.url} delay={i * 100}>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="news-card"
              style={{ textDecoration: 'none', display: 'block' }}
            >
              {article.image ? (
                <img
                  src={article.image}
                  alt={article.title}
                  className="news-card-img"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="news-card-img-placeholder">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
              )}
              <div className="news-card-body">
                <p className="news-card-date">
                  {article.source?.name} · {new Date(article.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <h3 className="news-card-title">{article.title}</h3>
                {article.description && (
                  <p className="news-card-excerpt" style={{ WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {article.description}
                  </p>
                )}
                <span className="news-card-link">
                  Lire l'article
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </span>
              </div>
            </a>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
)}
```

- [ ] **Step 3 : Vérifier**

Sans clé GNews configurée → section masquée silencieusement (aucun espace vide).
Avec clé GNews valide → 3 cards apparaissent avant le CTA final.

- [ ] **Step 4 : Commit**

```bash
git add client/src/pages/Home.jsx
git commit -m "feat: add GNews preview section on homepage (3 articles, hidden if no key)"
```

---

## Task 6 : MarketPage.jsx — implémentation complète

**Files:**
- Modify: `client/src/pages/MarketPage.jsx`

- [ ] **Step 1 : Remplacer le skeleton par l'implémentation complète**

Remplacer le contenu de `client/src/pages/MarketPage.jsx` :

```jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import SEO from '../components/SEO.jsx';
import ScrollReveal from '../components/ScrollReveal.jsx';

export default function MarketPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news?max=9')
      .then((r) => r.json())
      .then((data) => setArticles(data.articles || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SEO
        title="Comprendre le marché de l'énergie | Voltea Énergie"
        description="Actualités du marché de l'énergie, prix de l'électricité et du gaz, tendances du courtage. Restez informé avec Voltea Énergie."
        canonical="/marche-energie"
      />
      <Header />

      {/* ── HERO ── */}
      <section className="section section--white" style={{ paddingTop: 'calc(var(--header-height) + 4rem)', paddingBottom: '3rem' }}>
        <div className="container">
          <ScrollReveal>
            <span className="section-label">Marché de l'énergie</span>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '1rem', maxWidth: '700px' }}>
              Comprendre le marché de l'énergie
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', maxWidth: '600px', marginBottom: '2rem' }}>
              Électricité, gaz, prix spot, fournisseurs… le marché de l'énergie évolue en permanence.
              Retrouvez ici les dernières actualités pour prendre les bonnes décisions au bon moment.
            </p>
            <Link to="/guide-energie" className="btn btn-outline">
              Découvrir notre guide des fournisseurs
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ── ACTUALITÉS ── */}
      <section className="section section--light">
        <div className="container">
          <ScrollReveal>
            <h2 className="section-title">Actualités du marché</h2>
          </ScrollReveal>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem' }} />
              <p>Chargement des actualités…</p>
            </div>
          ) : articles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
              <p>Les actualités sont temporairement indisponibles. Revenez prochainement.</p>
            </div>
          ) : (
            <div className="news-grid">
              {articles.map((article, i) => (
                <ScrollReveal key={article.url} delay={i * 80}>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="news-card"
                    style={{ textDecoration: 'none', display: 'block' }}
                  >
                    {article.image ? (
                      <img
                        src={article.image}
                        alt={article.title}
                        className="news-card-img"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="news-card-img-placeholder">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </div>
                    )}
                    <div className="news-card-body">
                      <p className="news-card-date">
                        {article.source?.name} · {new Date(article.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <h3 className="news-card-title">{article.title}</h3>
                      {article.description && (
                        <p className="news-card-excerpt" style={{ WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {article.description}
                        </p>
                      )}
                      <span className="news-card-link">
                        Lire l'article
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </span>
                    </div>
                  </a>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── BANNIÈRE GUIDE ── */}
      <section className="section section--white">
        <div className="container">
          <ScrollReveal>
            <div className="why-voltea-card" style={{ textAlign: 'center' }}>
              <span className="section-label">Guide pratique</span>
              <h2 style={{ marginBottom: '1rem' }}>Qui sont les fournisseurs d'énergie ?</h2>
              <p style={{ color: 'var(--color-text-muted)', maxWidth: '560px', margin: '0 auto 2rem' }}>
                EDF, Engie, TotalEnergies, Ekwateur… Tous ne se valent pas selon votre profil de consommation.
                Notre guide compare les principaux fournisseurs pour vous aider à y voir clair.
              </p>
              <Link to="/guide-energie" className="btn btn-primary">
                Accéder au guide des fournisseurs
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section section--light" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <ScrollReveal>
            <h2 style={{ marginBottom: '1rem', fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)' }}>
              Un expert à votre côté pour naviguer le marché
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
              Voltea Énergie surveille le marché pour vous et négocie au moment opportun.
            </p>
            <Link to="/contact" className="btn btn-primary btn-lg">
              Contactez-nous
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
```

- [ ] **Step 2 : Vérifier**

Naviguer vers `/marche-energie`.
- Sans clé : spinner → message "temporairement indisponibles"
- Avec clé : 9 articles en grille, chaque card ouvre l'article dans un nouvel onglet
- Bannière guide visible entre les actualités et le CTA
- Lien "Accéder au guide" pointe vers `/guide-energie`

- [ ] **Step 3 : Commit**

```bash
git add client/src/pages/MarketPage.jsx
git commit -m "feat: implement full MarketPage with GNews grid, guide banner and CTA"
```

---

## Task 7 : Guide énergie — données + pages + routes

**Files:**
- Create: `client/src/data/providersData.js`
- Create: `client/src/pages/GuideIndex.jsx`
- Create: `client/src/pages/ProviderPage.jsx`
- Modify: `client/src/App.jsx`

- [ ] **Step 1 : Créer providersData.js**

Créer `client/src/data/providersData.js` :

```js
// Logos : Wikipedia Commons (SVG→PNG) pour EDF, Engie, TotalEnergies, Vattenfall, ENI, Alpiq.
// Pour Ekwateur et Primeo, logoUrl est null → affichage d'initiales stylisées côté UI.

export const providers = [
  {
    slug: 'edf',
    name: 'EDF',
    fullName: 'Électricité de France',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/EDF_logo.svg/240px-EDF_logo.svg.png',
    tagline: 'Le fournisseur historique français, solide et reconnu',
    category: 'Historique',
    description: [
      "EDF (Électricité de France) est le fournisseur d'énergie historique en France et l'un des plus grands producteurs d'électricité en Europe. Fondé en 1946, il s'appuie sur un parc de production massif — notamment nucléaire — qui couvre environ 70 % de la production électrique nationale.",
      "Pour les professionnels, EDF propose des contrats adaptés à toutes les tailles d'entreprises, des TPE aux grands industriels, avec une gamme allant des tarifs réglementés (pour les sites éligibles) aux offres de marché à prix fixes ou indexés.",
    ],
    offers: [
      { label: 'Électricité', description: 'Offres aux tarifs réglementés (TRV) et contrats de marché indexés ou à prix fixes' },
      { label: 'Gaz naturel', description: 'Offres de marché depuis la fin des tarifs réglementés en 2023' },
      { label: 'Énergie verte', description: 'Options « Vertiss » avec garanties d\'origine renouvelable certifiées' },
    ],
    pros: [
      'Solidité financière et pérennité garantie',
      'Réseau d\'agences physiques sur tout le territoire',
      'Offres adaptées aux grands consommateurs industriels',
      'Facturation claire avec historique détaillé en ligne',
    ],
    cons: [
      'Tarifs souvent moins compétitifs que les fournisseurs alternatifs pour les PME',
      'Service client parfois difficile à joindre pour les professionnels',
      'Moins de flexibilité commerciale que les nouveaux entrants du marché',
    ],
    profiles: ['TPE', 'PME', 'Industrie'],
  },
  {
    slug: 'engie',
    name: 'Engie',
    fullName: 'Engie (ex-GDF Suez)',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Engie_logo.svg/240px-Engie_logo.svg.png',
    tagline: 'L\'acteur de référence sur le marché du gaz professionnel',
    category: 'Historique',
    description: [
      "Engie, anciennement GDF Suez, est le deuxième grand fournisseur historique français. Issu de la fusion entre Gaz de France et Suez en 2008, il est historiquement le leader du gaz naturel en France. Aujourd'hui, il a largement diversifié son offre vers l'électricité et les énergies renouvelables à l'échelle mondiale.",
      "Pour les professionnels, Engie propose des contrats gaz et électricité adaptés à chaque profil, avec une expertise reconnue sur les sites multi-installations et les volumes importants. Sa filiale Engie Pro se consacre spécifiquement aux entreprises.",
    ],
    offers: [
      { label: 'Gaz naturel', description: 'Contrats à prix fixes ou indexés PEG, avec garantie de volume possible' },
      { label: 'Électricité', description: 'Offres de marché compétitives pour PME, ETI et multi-sites' },
      { label: 'Énergies renouvelables', description: 'Offres vertes certifiées, contrats PPA (Power Purchase Agreement) pour grandes entreprises' },
    ],
    pros: [
      'Expertise historique incomparable sur le gaz naturel',
      'Offres multi-énergie attractives pour les sites combinant gaz et électricité',
      'Forte présence sur les contrats de grande consommation',
      'Solutions de transition énergétique (biométhane, hydrogène vert)',
    ],
    cons: [
      'Prix parfois moins compétitifs sur les petits volumes de gaz',
      'Processus contractuels parfois longs pour les PME',
      'Service client variable selon les régions et les interlocuteurs',
    ],
    profiles: ['PME', 'ETI', 'Industrie', 'Multi-sites'],
  },
  {
    slug: 'totalenergies',
    name: 'TotalEnergies',
    fullName: 'TotalEnergies Electricité & Gaz France',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/TotalEnergies_logo.svg/240px-TotalEnergies_logo.svg.png',
    tagline: 'Le challenger dynamique issu d\'une major pétrolière mondiale',
    category: 'Alternatif',
    description: [
      "TotalEnergies Electricité & Gaz France est la filiale de fourniture d'énergie du groupe TotalEnergies, née de l'acquisition de Direct Énergie en 2018. Elle a rapidement gagné des parts de marché grâce à des offres compétitives et un fort investissement commercial.",
      "Le groupe investit massivement dans les énergies renouvelables (solaire, éolien) et les mobilités décarbonées. Pour les professionnels, TotalEnergies propose des contrats flexibles — indexés ou à prix fixes — souvent inférieurs aux tarifs des fournisseurs historiques.",
    ],
    offers: [
      { label: 'Électricité', description: 'Offres à prix fixes ou indexés SPOT, contrats de 1 à 3 ans' },
      { label: 'Gaz naturel', description: 'Contrats à prix fixes ou indexés PEG pour tous profils' },
      { label: 'Électricité verte', description: '100% renouvelable avec garanties d\'origine sur demande' },
    ],
    pros: [
      'Tarifs très compétitifs, surtout en période de marché favorable',
      'Offres innovantes avec options d\'indexation SPOT pour les consommateurs avertis',
      'Interlocuteurs commerciaux réactifs et disponibles',
      'Forte capacité de production renouvelable propre en Europe',
    ],
    cons: [
      'Offres SPOT exposées à la volatilité des marchés de l\'énergie',
      'Moins implanté localement que les fournisseurs historiques',
      'Gestion des litiges parfois complexe pour les PME',
    ],
    profiles: ['TPE', 'PME', 'ETI'],
  },
  {
    slug: 'ekwateur',
    name: 'Ekwateur',
    fullName: 'Ekwateur',
    logoUrl: null,
    tagline: 'L\'énergie verte indépendante, engagée et transparente',
    category: 'Vert & Indépendant',
    description: [
      "Ekwateur est un fournisseur d'énergie 100% indépendant, fondé en 2015, positionné sur les énergies renouvelables. Il se distingue par une transparence totale sur l'origine de l'électricité (éolien, solaire, hydraulique français) et par une politique tarifaire lisible.",
      "Pour les professionnels souhaitant valoriser leur engagement environnemental auprès de leurs clients et partenaires, Ekwateur est un choix cohérent : les contrats garantissent une fourniture certifiée, avec un bilan carbone réduit et communicable.",
    ],
    offers: [
      { label: 'Électricité verte', description: '100% renouvelable avec garanties d\'origine françaises certifiées par GRDF et RTE' },
      { label: 'Biogaz', description: 'Offres gaz vert issu de la méthanisation agricole française' },
      { label: 'Contrats pros', description: 'Contrats 12 à 24 mois adaptés aux TPE et PME' },
    ],
    pros: [
      'Transparence totale sur l\'origine de l\'énergie fournie',
      'Engagement environnemental réel, certifié par des organismes indépendants',
      'Tarifs compétitifs sur le segment de l\'énergie verte',
      'Service client reconnu et réactif',
    ],
    cons: [
      'Principalement adapté aux petits et moyens sites de consommation',
      'Offres biogaz moins développées que le portefeuille électricité',
      'Moins de flexibilité pour les très grands consommateurs industriels',
    ],
    profiles: ['TPE', 'PME', 'Copropriétés'],
  },
  {
    slug: 'vattenfall',
    name: 'Vattenfall',
    fullName: 'Vattenfall Energy Trading France',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Vattenfall_logo.svg/240px-Vattenfall_logo.svg.png',
    tagline: 'L\'expert nordique du marché d\'énergie B2B',
    category: 'Alternatif',
    description: [
      "Vattenfall est un groupe énergétique suédois d'envergure européenne, présent en France principalement sur le segment B2B. Il est reconnu pour son expertise sur les marchés de gros de l'énergie et sa capacité à proposer des contrats sophistiqués aux consommateurs professionnels avec des volumes significatifs.",
      "En France, Vattenfall se concentre sur les clients professionnels, offrant des produits d'achat structurés (contrats profilés, achats fractionnés) permettant de sécuriser les prix sur les marchés à terme.",
    ],
    offers: [
      { label: 'Électricité B2B', description: 'Contrats sur mesure pour PME, ETI et industriels (sites > 36 kVA)' },
      { label: 'Produits structurés', description: 'Achats fractionnés et contrats profilés pour sécuriser les prix sur les marchés à terme' },
      { label: 'Énergie renouvelable', description: 'Offres vertes avec garanties d\'origine européennes certifiées' },
    ],
    pros: [
      'Expertise reconnue sur les produits d\'achat d\'énergie complexes',
      'Idéal pour les sites avec forte consommation (> 500 MWh/an)',
      'Solidité financière d\'un groupe nordique coté',
      'Interlocuteurs spécialisés en marchés de gros de l\'électricité',
    ],
    cons: [
      'Non adapté aux TPE et petites PME (volumes insuffisants)',
      'Offres gaz moins développées que le portefeuille électricité',
      'Présence commerciale terrain limitée en France hors grandes agglomérations',
    ],
    profiles: ['PME', 'ETI', 'Industrie'],
  },
  {
    slug: 'eni',
    name: 'ENI',
    fullName: 'ENI Gas & Power France',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/ENI_logo.svg/240px-ENI_logo.svg.png',
    tagline: 'La major italienne avec des offres compétitives sur le marché français',
    category: 'Alternatif',
    description: [
      "ENI Gas & Power est la filiale de fourniture d'énergie du groupe pétrolier et gazier italien ENI, présente sur le marché français depuis 2012. Acteur alternatif reconnu, ENI propose des offres gaz et électricité aux professionnels à des tarifs généralement inférieurs aux fournisseurs historiques.",
      "Sa force réside dans sa capacité à proposer des prix attractifs grâce aux synergies avec ses activités de production et de négoce énergétique à l'échelle internationale.",
    ],
    offers: [
      { label: 'Gaz naturel', description: 'Contrats à prix fixes ou indexés pour tous profils de consommation professionnelle' },
      { label: 'Électricité', description: 'Offres de marché compétitives pour PME et ETI' },
      { label: 'Énergie verte', description: 'Options électricité renouvelable avec garanties d\'origine disponibles' },
    ],
    pros: [
      'Tarifs compétitifs, notamment sur le gaz naturel',
      'Offres adaptées aux sites multi-installations',
      'Processus de souscription relativement simplifié',
      'Groupe international financièrement solide',
    ],
    cons: [
      'Service client moins accessible que les fournisseurs historiques',
      'Moins de solutions sur-mesure pour les très grands industriels',
      'Présence commerciale terrain limitée en France',
    ],
    profiles: ['TPE', 'PME', 'ETI', 'Multi-sites'],
  },
  {
    slug: 'alpiq',
    name: 'Alpiq',
    fullName: 'Alpiq Energie France',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Alpiq_logo.svg/240px-Alpiq_logo.svg.png',
    tagline: 'Le spécialiste suisse des contrats d\'énergie pour industriels',
    category: 'Alternatif',
    description: [
      "Alpiq est un groupe énergétique suisse actif sur les marchés européens de l'électricité. En France, Alpiq Energie France cible principalement les clients industriels et les ETI avec des volumes de consommation importants, en proposant des produits d'achat structurés.",
      "Alpiq est reconnu pour ses solutions de gestion du risque prix : contrats en tranches, produits caps/floors, achats sur les marchés à terme. C'est un interlocuteur de choix pour les entreprises souhaitant piloter activement leur budget énergie.",
    ],
    offers: [
      { label: 'Électricité industrielle', description: 'Contrats sur mesure pour sites > 500 MWh/an' },
      { label: 'Achats structurés', description: 'Contrats en tranches, produits caps/floors pour sécuriser les prix sur les marchés à terme' },
      { label: 'Énergie verte', description: 'Contrats PPA (Power Purchase Agreement) et garanties d\'origine renouvelables' },
    ],
    pros: [
      'Expertise de haut niveau sur les produits d\'achat d\'énergie complexes',
      'Idéal pour les industriels souhaitant optimiser leur stratégie d\'achat',
      'Solidité financière d\'un groupe suisse de référence',
      'Accompagnement dédié sur la gestion du risque prix',
    ],
    cons: [
      'Non adapté aux TPE et PME (seuils de consommation élevés)',
      'Contrats complexes nécessitant un accompagnement spécialisé (courtier recommandé)',
      'Offres gaz moins développées que le portefeuille électricité',
    ],
    profiles: ['Industrie', 'ETI', 'Grands comptes'],
  },
  {
    slug: 'primeo-energie',
    name: 'Primeo Énergie',
    fullName: 'Primeo Énergie France',
    logoUrl: null,
    tagline: 'L\'alternatif simple et compétitif pour les PME françaises',
    category: 'Alternatif',
    description: [
      "Primeo Énergie est un fournisseur alternatif d'électricité et de gaz naturel, filiale du groupe suisse Primeo AG. Présent sur le marché français, il se positionne sur le segment des TPE et PME avec des offres simples, des tarifs compétitifs et une démarche commerciale transparente.",
      "Sa proposition de valeur repose sur la clarté contractuelle : pas de frais d'entrée, pas de pénalité de sortie anticipée hors engagement, et des prix fixes garantissant la maîtrise du budget énergie sur la durée du contrat.",
    ],
    offers: [
      { label: 'Électricité', description: 'Offres à prix fixes sur 1 ou 2 ans pour TPE et PME' },
      { label: 'Gaz naturel', description: 'Contrats à prix fixes pour maîtriser le budget énergie sans mauvaise surprise' },
      { label: 'Énergie verte', description: 'Option électricité 100% renouvelable avec garanties d\'origine disponible' },
    ],
    pros: [
      'Tarifs compétitifs avec engagement de prix fixe sur la durée',
      'Offres simples, sans frais cachés ni engagement abusif',
      'Processus de souscription rapide, adapté aux structures sans direction énergie',
      'Interlocuteurs commerciaux accessibles',
    ],
    cons: [
      'Notoriété encore limitée en France comparée aux grands acteurs',
      'Non adapté aux grands comptes et industriels avec volumes importants',
      'Réseau d\'agences physiques absent sur le territoire',
    ],
    profiles: ['TPE', 'PME'],
  },
];

export function getProviderBySlug(slug) {
  return providers.find((p) => p.slug === slug) || null;
}
```

- [ ] **Step 2 : Créer GuideIndex.jsx**

Créer `client/src/pages/GuideIndex.jsx` :

```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import SEO from '../components/SEO.jsx';
import ScrollReveal from '../components/ScrollReveal.jsx';
import { providers } from '../data/providersData.js';

const CATEGORY_COLORS = {
  'Historique': { bg: 'rgba(15,48,128,0.08)', text: 'var(--color-primary)' },
  'Alternatif': { bg: 'rgba(22,160,133,0.08)', text: '#16a085' },
  'Vert & Indépendant': { bg: 'rgba(39,174,96,0.08)', text: '#27ae60' },
};

export default function GuideIndex() {
  return (
    <>
      <SEO
        title="Guide des fournisseurs d'énergie | Voltea Énergie"
        description="Comparez les principaux fournisseurs d'énergie en France : EDF, Engie, TotalEnergies, Ekwateur, Vattenfall, ENI, Alpiq. Fiches détaillées pour professionnels."
        canonical="/guide-energie"
      />
      <Header />

      {/* ── HERO ── */}
      <section className="section section--white" style={{ paddingTop: 'calc(var(--header-height) + 4rem)', paddingBottom: '3rem' }}>
        <div className="container">
          <ScrollReveal>
            <span className="section-label">Guide pratique</span>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '1rem', maxWidth: '700px' }}>
              Guide des fournisseurs d'énergie
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', maxWidth: '600px', marginBottom: '2rem' }}>
              Tous les fournisseurs ne se valent pas selon votre profil de consommation.
              Découvrez les caractéristiques, offres et points forts de chaque acteur du marché.
            </p>
            <Link to="/contact" className="btn btn-primary">
              Demander une comparaison personnalisée
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ── GRILLE FOURNISSEURS ── */}
      <section className="section section--light">
        <div className="container">
          <div className="features-grid">
            {providers.map((provider, i) => {
              const catStyle = CATEGORY_COLORS[provider.category] || CATEGORY_COLORS['Alternatif'];
              return (
                <ScrollReveal key={provider.slug} delay={i * 60}>
                  <Link
                    to={`/guide-energie/${provider.slug}`}
                    className="card card--light"
                    style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}
                  >
                    {/* Logo ou initiales */}
                    <div style={{ height: '64px', display: 'flex', alignItems: 'center' }}>
                      {provider.logoUrl ? (
                        <img
                          src={provider.logoUrl}
                          alt={`Logo ${provider.name}`}
                          style={{ maxHeight: '48px', maxWidth: '140px', objectFit: 'contain' }}
                          loading="lazy"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-md)', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.2rem' }}>
                          {provider.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <h2 style={{ fontSize: '1.1rem', margin: 0 }}>{provider.name}</h2>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '999px', background: catStyle.bg, color: catStyle.text }}>
                          {provider.category}
                        </span>
                      </div>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
                        {provider.tagline}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: 500 }}>
                      Voir la fiche
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section section--white" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <ScrollReveal>
            <h2 style={{ marginBottom: '1rem', fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)' }}>
              Vous hésitez entre plusieurs fournisseurs ?
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
              Voltea Énergie les met en concurrence pour vous et négocie les meilleures conditions selon votre profil.
            </p>
            <Link to="/contact" className="btn btn-primary btn-lg">
              Obtenir une étude sans frais
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
```

- [ ] **Step 3 : Créer ProviderPage.jsx**

Créer `client/src/pages/ProviderPage.jsx` :

```jsx
import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import SEO from '../components/SEO.jsx';
import ScrollReveal from '../components/ScrollReveal.jsx';
import { getProviderBySlug } from '../data/providersData.js';

export default function ProviderPage() {
  const { slug } = useParams();
  const provider = getProviderBySlug(slug);

  if (!provider) {
    return <Navigate to="/guide-energie" replace />;
  }

  return (
    <>
      <SEO
        title={`${provider.name} — Fournisseur d'énergie | Voltea Énergie`}
        description={`Découvrez les offres ${provider.name} (${provider.fullName}) pour les professionnels. ${provider.tagline}. Analyse complète par Voltea Énergie.`}
        canonical={`/guide-energie/${provider.slug}`}
      />
      <Header />

      {/* ── HEADER FICHE ── */}
      <section className="section section--white" style={{ paddingTop: 'calc(var(--header-height) + 4rem)', paddingBottom: '3rem' }}>
        <div className="container">
          <ScrollReveal>
            <Link to="/guide-energie" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '2rem', textDecoration: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Retour au guide
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {provider.logoUrl ? (
                <img
                  src={provider.logoUrl}
                  alt={`Logo ${provider.name}`}
                  style={{ maxHeight: '64px', maxWidth: '180px', objectFit: 'contain' }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-lg)', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.4rem', flexShrink: 0 }}>
                  {provider.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', margin: '0 0 0.25rem' }}>{provider.name}</h1>
                <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>{provider.fullName}</p>
              </div>
            </div>

            <p style={{ fontSize: '1.15rem', color: 'var(--color-text-muted)', maxWidth: '650px' }}>
              {provider.tagline}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── PRÉSENTATION ── */}
      <section className="section section--light">
        <div className="container">
          <ScrollReveal>
            <div style={{ maxWidth: '720px' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Présentation</h2>
              {provider.description.map((para, i) => (
                <p key={i} style={{ color: 'var(--color-text-muted)', lineHeight: '1.8', marginBottom: '1rem' }}>
                  {para}
                </p>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── OFFRES ── */}
      <section className="section section--white">
        <div className="container">
          <ScrollReveal>
            <h2 style={{ marginBottom: '2rem' }}>Offres proposées</h2>
          </ScrollReveal>
          <div className="features-grid">
            {provider.offers.map((offer, i) => (
              <ScrollReveal key={offer.label} delay={i * 80}>
                <div className="card card--light" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'rgba(20,110,243,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>{offer.label}</h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>{offer.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROS / CONS ── */}
      <section className="section section--light">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <ScrollReveal>
              <h2 style={{ marginBottom: '1.25rem' }}>Points forts</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {provider.pros.map((pro) => (
                  <li key={pro} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <span style={{ flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(39,174,96,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.925rem', lineHeight: '1.6' }}>{pro}</span>
                  </li>
                ))}
              </ul>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h2 style={{ marginBottom: '1.25rem' }}>Points de vigilance</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {provider.cons.map((con) => (
                  <li key={con} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <span style={{ flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.925rem', lineHeight: '1.6' }}>{con}</span>
                  </li>
                ))}
              </ul>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── PROFILS ── */}
      <section className="section section--white">
        <div className="container">
          <ScrollReveal>
            <h2 style={{ marginBottom: '1.25rem' }}>Pour quel profil ?</h2>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {provider.profiles.map((profile) => (
                <span
                  key={profile}
                  style={{ padding: '0.4rem 1rem', borderRadius: '999px', background: 'rgba(20,110,243,0.08)', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.875rem' }}
                >
                  {profile}
                </span>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── CTA VOLTEA ── */}
      <section className="section section--light" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <ScrollReveal>
            <div className="why-voltea-card" style={{ textAlign: 'center' }}>
              <h2 style={{ marginBottom: '1rem' }}>
                {provider.name} correspond à votre profil ?
              </h2>
              <p style={{ color: 'var(--color-text-muted)', maxWidth: '520px', margin: '0 auto 2rem' }}>
                Voltea Énergie met {provider.name} en concurrence avec plus de 20 fournisseurs partenaires
                et négocie les meilleures conditions pour vous — sans frais.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/contact" className="btn btn-primary btn-lg">
                  Demander une étude sans frais
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
                <Link to="/guide-energie" className="btn btn-outline btn-lg">
                  Voir les autres fournisseurs
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
```

- [ ] **Step 4 : Ajouter les routes dans App.jsx**

Ajouter les imports après l'import de `MarketPage` :
```jsx
import GuideIndex from './pages/GuideIndex.jsx';
import ProviderPage from './pages/ProviderPage.jsx';
```

Ajouter les routes après `<Route path="/marche-energie" ...>` :
```jsx
<Route path="/guide-energie" element={<GuideIndex />} />
<Route path="/guide-energie/:slug" element={<ProviderPage />} />
```

- [ ] **Step 5 : Vérifier dans le navigateur**

Tester les URLs suivantes :
- `http://localhost:5173/guide-energie` → grille des 8 fournisseurs
- `http://localhost:5173/guide-energie/edf` → fiche EDF avec logo Wikipedia
- `http://localhost:5173/guide-energie/ekwateur` → fiche Ekwateur avec initiales "EK" (pas de logo)
- `http://localhost:5173/guide-energie/fournisseur-inconnu` → redirige vers `/guide-energie`
- Le bouton "Retour au guide" fonctionne sur chaque fiche
- Depuis MarketPage, cliquer sur "Accéder au guide des fournisseurs" → GuideIndex

- [ ] **Step 6 : Commit final**

```bash
git add client/src/data/providersData.js client/src/pages/GuideIndex.jsx client/src/pages/ProviderPage.jsx client/src/App.jsx
git commit -m "feat: add energy providers guide with 8 provider pages (GuideIndex + ProviderPage)"
```
