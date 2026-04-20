# Audit SEO — Voltea Énergie (v3)

**Date :** 2026-04-20
**Scope :** code statique uniquement (pas de crawl live, pas de Lighthouse)
**Score global estimé :** **62 / 100**

---

## Résumé exécutif

Le site est **propre sur les fondamentaux on-page** (titles/descriptions/canonicals cohérents via `SEO.jsx`, noindex correctement posé sur `/admin/*` et pages légales, sitemap dynamique + robots.txt côté serveur). En revanche, **deux gros risques SEO structurels subsistent** :

1. **SPA pure, aucun SSR/prerender** → invisible pour les crawlers AI (ChatGPT/Perplexity/Claude) et rendu incomplet pour Bing/autres.
2. **Poids des assets catastrophique** (hero vidéo 29 Mo, PNG fondateur 21 Mo) → LCP désastreux, CrUX rouge garanti.

Les autres points sont des optimisations normales, priorisées plus bas.

---

## Top 5 — Critique (à corriger vite)

| # | Sujet | Impact |
|---|---|---|
| 1 | `voltea-energie-jeremy-lozzi.png` = **21 Mo** (`assets/images/`) | LCP / bande passante mobile. Convertir en WebP/AVIF <200 kB. |
| 2 | `hero.mp4` = **29 Mo** sans `poster` ni version mobile | LCP + data-saver. Ajouter `poster`, réduire bitrate, desactiver sur mobile. |
| 3 | `/img/og-default.jpg` **n'existe pas** (référencé dans `index.html` et `SEO.jsx`) | OG/Twitter cards cassées → 0 partage viral propre. |
| 4 | **Aucun prerender/SSR** pour une app React-Router pure CSR | Moteurs IA & crawlers non-JS voient une page vide. |
| 5 | SPA fallback `app.js:185` renvoie **200 sur toute URL inconnue** (soft 404) | Google peut indexer des variantes d'URL fantaisie. |

## Top 5 — Quick wins

| # | Sujet | Où |
|---|---|---|
| 1 | H1 homepage = juste "Voltea Énergie" (peu de poids keyword) | `Home.jsx:82` — intégrer "Courtier en énergie à Bourgoin-Jallieu" dans le H1. |
| 2 | Guide fournisseurs absent du header | `Header.jsx:4` — ajouter `{ to: '/guide-energie', label: 'Fournisseurs' }`. |
| 3 | Footer : liens trompeurs ("Nos partenaires" → /services, "FAQ" → /contact) | `Footer.jsx:71-72` — supprimer ou rediriger vers vraies cibles. |
| 4 | Dead file `Collectivites.jsx` | Supprimer, pas de route associée. |
| 5 | `loading="eager"` + `fetchpriority="high"` sur image LCP | Actuellement toutes les images sont `lazy`, y compris celles au-dessus du pli. |

---

## 1. Technique (25 %) — Note 6/10

### ✅ OK
- `robots.txt` servi correctement (`app.js:99`), avec sitemap référencé.
- `sitemap.xml` dynamique avec articles publiés (`src/routes/sitemap.js`).
- HSTS 1 an + preload en prod, CSP lockdown sur scripts/frames.
- Canonical absolu sur chaque page via `SEO.jsx`.
- HTML lang="fr", viewport meta OK.

### ⚠️ À corriger
- **Rendu JS only** : aucun prerender (pas de `vite-plugin-prerender`, pas de SSR). Les pages `/guide-energie/*`, `/actualites/:slug` sont dépendantes de JS + fetch API. ChatGPT/Perplexity/ClaudeBot = 0 contenu.
  - **Fix recommandé** : ajouter `vite-plugin-prerender-spa` ou migrer sur Next.js / Astro si scope le permet. Minimum : prerender statique des pages publiques (home, services, guides, about, contact, market).
- **Soft 404** : `app.get('*', ...)` renvoie toujours `200 + index.html`. Pour URLs hors whitelist, renvoyer `404` côté serveur.
- Sitemap : `lastmod` absent sur les pages statiques (seulement sur articles). Ajouter `<lastmod>` pour aider au recrawl.
- Header `Cache-Control: public, max-age=86400` OK pour sitemap, mais `X-Robots-Tag` absent → à ajouter sur `/admin/*` côté serveur en defense-in-depth.

### ❌ Absent
- Pas de `llms.txt` (fichier indicateur pour LLM crawlers — recommandé pour GEO).
- Pas de hreflang (OK si monolingue FR).

---

## 2. On-page (20 %) — Note 7/10

| Page | Title | Description | H1 | Canonical |
|------|-------|-------------|----|-----------|
| `/` | ✅ | ✅ | ⚠️ "Voltea Énergie" seul — faible | ✅ |
| `/a-propos` | ✅ | ✅ | ✅ "À propos de Voltea Énergie" | ✅ |
| `/services` | ✅ | ✅ | ✅ | ✅ |
| `/marche-energie` | ⚠️ trop court | ✅ | ✅ | ✅ |
| `/guide-energie` | ✅ | ✅ | ✅ | ✅ |
| `/guide-energie/:slug` | ✅ dynamique | ✅ | ✅ | ✅ |
| `/actualites` | ✅ | ✅ | ✅ | ✅ |
| `/actualites/:slug` | ✅ dynamique | ✅ | ✅ | ✅ |
| `/contact` | ✅ | ✅ | ✅ | ✅ |
| `/mentions-legales` | ✅ `noindex` | — | — | ✅ |
| `/politique-de-confidentialite` | ✅ `noindex` | — | — | ✅ |

**Points à corriger :**
- `Home.jsx:82` — H1 actuel `<h1>Voltea Énergie</h1>` : trop générique. Remplacer par quelque chose comme `<h1>Courtier en énergie à Bourgoin-Jallieu pour professionnels</h1>` et déplacer "Voltea Énergie" dans le branding visuel. (Note : tu travailles sur le hero ailleurs, garde-le en tête.)
- `MarketPage.jsx:23` — title "Comprendre le marché de l'énergie" → sera suffixé `| Voltea Énergie` = OK, mais 29 caractères avant suffixe → ajouter keyword "électricité gaz pro".
- **Maillage interne** : `/guide-energie` absent du header nav (`Header.jsx`). Section à fort potentiel longue-traîne (fiches EDF/Engie/etc.) orpheline.

---

## 3. Schema / Structured data (10 %) — Note 5/10

### ✅ Présent
- `LocalBusiness` global (`App.jsx:72`) — coordonnées, geo, areaServed, telephone, email.
- `NewsArticle` par article (`NewsDetail.jsx:80`) — publisher, author, dates.

### ❌ Manquant ou incomplet
- **`LocalBusiness` incomplet** :
  - `priceRange` absent (ex: "Gratuit" ou "Sur devis")
  - `openingHours` absent
  - `image` absente
  - `@type` devrait être plus précis (`ProfessionalService` ou `FinancialService`)
- **`Organization`** séparée du LocalBusiness avec `sameAs` étendu (LinkedIn, Facebook présents dans footer mais pas dans schema)
- **`BreadcrumbList`** absent sur toutes les pages internes → opportunité de rich snippets.
- **`Person` schema pour Jérémy Lozzi** sur `/a-propos` (E-E-A-T).
- **`FAQPage`** → aucune page FAQ, mais le footer a un lien "FAQ" qui mène à /contact. Créer vraie FAQ (forte valeur SEO).
- **`Article`** au lieu de `NewsArticle` pour les articles evergreen (guides, tutoriels).
- **`AggregateRating`** sur LocalBusiness — tu as des `reviews` en base, exploite-les.
- **Logo + sameAs** dans Organization pour Knowledge Panel Google.

---

## 4. Contenu / E-E-A-T (25 %) — Note 6/10

### ✅
- Pages services/about bien rédigées, fondateur nommé (Jérémy Lozzi), contact direct visible.
- Ton pro, pas de copie générique IA évidente.

### ⚠️
- Pages fiches fournisseurs (`/guide-energie/*`) : dépendent de `providersData.js` — vérifier la profondeur (>800 mots idéalement par fiche, sinon thin content).
- Page `/marche-energie` = principalement agrégation GNews → **risque duplicate content / thin content** si pas d'ajout éditorial original.
- Aucun auteur affiché sur les articles (`NewsDetail` a l'author dans schema mais pas dans le corps HTML). Ajouter bio courte en bas d'article.
- Pas de dates de publication / mise à jour visibles sur les guides fournisseurs.
- Pas de contenu type "cas client / témoignage" nommé (on voit des logos + stars mais pas de récit).

### ❌
- Pas de page FAQ réelle (grosse opportunité GEO/AI citations).
- Pas de glossaire (CSPE, TICGN mentionnés mais pas expliqués en profondeur).

---

## 5. Performance (10 %) — Note 3/10

**Non mesuré live**, mais signaux statiques alarmants :

| Fichier | Taille | Problème |
|---|---|---|
| `assets/videos/hero.mp4` | **29 Mo** | Aucun `poster`, pas de version mobile, autoplay systématique |
| `assets/images/voltea-energie-jeremy-lozzi.png` | **21 Mo** | PNG non optimisé, devrait être WebP <200 kB |
| Total assets | ~53 Mo | Hors raisonnable pour un site vitrine |

**Actions :**
- Compresser `hero.mp4` (x264 CRF 28, 720p max → viser <3 Mo) + poster image + `media` query pour désactiver sur mobile.
- Convertir tous les JPG/PNG en WebP (sharp est déjà dans `package.json` — tu peux scripter).
- Ajouter `<link rel="preload" as="image" fetchpriority="high">` sur image hero/LCP.
- Enlever `loading="lazy"` sur la première image visible.
- Fonts : preload `DM Sans 400` en plus du preconnect.

---

## 6. Images (5 %) — Note 7/10

- ✅ `alt` présents et descriptifs sur la quasi-totalité (sauf `Home.jsx:427` et `Reviews.jsx:369` avec `alt=""`, OK si décoratif — à confirmer).
- ✅ `loading="lazy"` systématique.
- ⚠️ Pas de `width`/`height` explicites → CLS potentiel.
- ❌ Pas de `<picture>` avec `srcset` responsive → 21 Mo servi aux mobiles aussi.

---

## 7. AI Search / GEO (5 %) — Note 2/10

**C'est le point le plus pénalisant à moyen terme.**

- ❌ Contenu **invisible sans exécution JS** : GPTBot, PerplexityBot, ClaudeBot, Bingbot (partiellement) ne verront que `<div id="root"></div>`.
- ❌ Pas de `llms.txt`.
- ❌ Pas de Q&A structurées passage-citables.
- ⚠️ `<title>` + `<meta description>` en SSR dans `index.html` mais écrasés par Helmet côté client → OK pour Google JS-rendering, KO pour les autres.
- ✅ `robots.txt` n'interdit pas les bots IA (OK ou pas OK selon stratégie).

**Recommandation forte** : prerender minimum les 10 pages publiques principales en HTML statique à build-time.

---

## Plan d'action priorisé

### Critique (cette semaine)
1. **Compresser hero.mp4 + jeremy.png** (gain immédiat de ~45 Mo).
2. **Créer `/img/og-default.jpg`** (1200×630, JPG <100 kB).
3. **Ajouter prerender SPA** (`vite-plugin-prerender` ou équivalent).
4. **Fix soft 404** : whitelist d'URLs côté Express, fallback 404 propre.

### Haute (ce mois)
5. **Enrichir `LocalBusiness`** : priceRange, openingHours, image, sameAs complet.
6. **Ajouter `BreadcrumbList`** sur toutes les pages internes.
7. **Ajouter "Guide fournisseurs" dans le header** + dans le menu mobile.
8. **Vraie page FAQ** avec schema `FAQPage`.
9. **Fix footer** : "Nos partenaires" et "FAQ" pointent faux.
10. **Renforcer H1 homepage** avec keyword local (à faire avec le nouveau hero).

### Moyenne (ce trimestre)
11. Convertir toutes les images en WebP via script sharp.
12. `srcset`/`<picture>` responsive sur toutes les images hero/cover.
13. Bio auteur visible sur les articles.
14. `AggregateRating` depuis la table `reviews`.
15. `Person` schema sur /a-propos.
16. Glossaire CSPE/TICGN/TRV (1 page, fort potentiel longue-traîne).
17. Audit contenu des fiches fournisseurs (≥800 mots chacune).

### Basse (backlog)
18. `llms.txt`.
19. Supprimer `Collectivites.jsx` (dead code).
20. `lastmod` sur pages statiques du sitemap.
21. `X-Robots-Tag` HTTP sur /admin/*.

---

## Score détaillé

| Catégorie | Poids | Note | Pondéré |
|---|---|---|---|
| Technique | 25 % | 6/10 | 15 |
| Contenu / E-E-A-T | 25 % | 6/10 | 15 |
| On-page | 20 % | 7/10 | 14 |
| Schema | 10 % | 5/10 | 5 |
| Performance | 10 % | 3/10 | 3 |
| Images | 5 % | 7/10 | 3,5 |
| AI Search | 5 % | 2/10 | 1 |
| **Total** | **100 %** | | **~57-62/100** |

Le site peut monter à **80+** rapidement en traitant uniquement les 4 critiques + 6 hautes.
