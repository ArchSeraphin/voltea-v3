# Prerender / SSR — plan de décision

Le site est une SPA React-Router pure CSR. Google rend le JS, mais les crawlers IA (GPTBot, ClaudeBot, PerplexityBot) et plusieurs moteurs mineurs ne voient que `<div id="root"></div>`. Le prerender / SSR résout ça. Trois chemins possibles, du plus léger au plus propre :

---

## Option A — `react-snap` post-build *(le plus léger, ~200 Mo de dev deps)*

### Principe
Après `vite build`, un script lance Chrome headless, crawle chaque route de la SPA, et sauvegarde le HTML rendu dans `client/dist/<route>/index.html`. Express sert ces snapshots en priorité.

### Mise en place
```bash
cd client
npm install --save-dev react-snap
```

`client/package.json` :
```json
{
  "scripts": {
    "build": "vite build && react-snap"
  },
  "reactSnap": {
    "source": "dist",
    "include": [
      "/",
      "/a-propos",
      "/services",
      "/guide-energie",
      "/guide-energie/edf",
      "/guide-energie/engie",
      "/guide-energie/totalenergies",
      "/guide-energie/ekwateur",
      "/guide-energie/vattenfall",
      "/guide-energie/eni",
      "/guide-energie/alpiq",
      "/guide-energie/primeo-energie",
      "/marche-energie",
      "/actualites",
      "/faq",
      "/contact"
    ],
    "crawl": false,
    "puppeteerArgs": ["--no-sandbox", "--disable-setuid-sandbox"]
  }
}
```

`client/src/main.jsx` (hydrate au lieu de render quand snapshot détecté) :
```js
import React from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/main.css';

const root = document.getElementById('root');
const app = <React.StrictMode><App /></React.StrictMode>;

if (root.hasChildNodes()) {
  hydrateRoot(root, app);
} else {
  createRoot(root).render(app);
}
```

### Limites
- react-snap est peu maintenu (dernier commit 2022) mais fonctionne toujours avec React 18 + react-helmet-async.
- Les routes dynamiques `/actualites/:slug` ne sont pas prerendered → fallback sur CSR (Google les indexera via JS).
- Puppeteer ajoute ~200 Mo à `node_modules` en dev.

---

## Option B — Vite SSR via `vite-plugin-ssr` / Vike *(propre, nécessite refactor)*

### Principe
Migration vers Vike (ex-vite-plugin-ssr). Chaque route a un `+Page.jsx` et un `+data.js`. Génération statique à build-time (SSG) ou SSR runtime.

### Mise en place
Refactor important de `App.jsx` et du routing. Environ 1-2 jours de travail.

### Avantage
- Approche moderne, maintenue, framework-grade.
- Peut servir aussi bien statique que SSR runtime (pour les articles).
- Hydratation partielle, streaming SSR, etc.

### Inconvénient
- Refactor significatif. À envisager uniquement si on prévoit d'autres features SSR (i18n, auth SSR, personnalisation).

---

## Option C — Dynamic rendering côté serveur *(compromis raisonnable)*

### Principe
Détecter les User-Agents de bots dans Express, et pour ces requêtes, exécuter une version SSR minimale de React en streaming. Les utilisateurs normaux continuent de recevoir la CSR.

### Implémentation
1. Ajouter `scripts/prerender-ssr.js` qui expose une fonction `renderRoute(url) → html`
2. Middleware Express :
   ```js
   const BOT_UA = /bot|crawl|spider|slurp|gptbot|claudebot|perplexity|anthropic|ccbot/i;
   app.use(async (req, res, next) => {
     if (!BOT_UA.test(req.get('user-agent') || '')) return next();
     const html = await renderRoute(req.url);
     res.send(html);
   });
   ```
3. Pour chaque route, SSR via `renderToString` + `StaticRouter` + pré-fetching des données API.

### Avantage
- Pas d'impact sur le bundle client.
- Pas de stockage statique.
- Flexible pour les routes dynamiques (articles).

### Inconvénient
- Google recommande d'éviter le "cloaking" — servir du contenu différent aux bots peut être risqué si fait maladroitement. En pratique, c'est toléré si le contenu SSR est équivalent au contenu CSR.
- Nécessite un bundle SSR séparé (Vite SSR mode).

---

## Recommandation

**Court terme (cette semaine) :** Option A — `react-snap`. Faible friction, gain immédiat pour les crawlers IA sur les 16 routes publiques statiques.

**Moyen terme (si volume/complexité grandit) :** Option B — migrer vers Vike. Mais pas urgent tant que le site reste une vitrine de 20 pages.

**Option C :** à éviter sauf si on tombe sur une limite bloquante avec Option A (certaines animations qui ne rendent pas, etc.).

---

## Impact SEO attendu

Après prerender (Option A) :
- **+100% de visibilité AI** : ChatGPT/Claude/Perplexity peuvent citer le contenu
- **Recrawl plus fiable** pour Bingbot, DuckDuckBot
- **LCP potentiellement meilleur** : le HTML arrive prêt, le JS peut se charger après
- **Pas de changement** pour Googlebot (qui rendait déjà le JS)

Score SEO global estimé : **62 → 78** après Option A implémentée.
