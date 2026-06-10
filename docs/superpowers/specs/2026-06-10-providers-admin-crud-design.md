# Gestion des fournisseurs depuis le dashboard admin — Design

**Date** : 2026-06-10
**Statut** : validé (brainstorming avec Nicolas)

## Objectif

Rendre la section Fournisseurs (`/guide-energie`) entièrement gérable depuis le
dashboard admin par Jérémy (le client, non technique) : créer, modifier,
masquer, réordonner et supprimer des fournisseurs, avec une fiche détaillée
identique aux fiches actuelles. Les 8 fournisseurs existants sont migrés en
base et deviennent modifiables. Le SEO des fiches reste parfait : le HTML
prérendu est régénéré automatiquement après chaque modification.

## Décisions clés

| Question | Décision |
|---|---|
| SEO après modif dashboard | Re-prerender automatique côté serveur (pas d'attente du prochain déploiement) |
| Utilisateur cible de l'admin | Jérémy → formulaire très guidé, zéro notion technique (pas de JSON/markdown) |
| Ordre d'affichage | Manuel (`sort_order` + flèches ↑↓ dans l'admin) |
| Statut | Toggle publié/masqué (pattern articles) |
| Contenu | Texte brut (paragraphes), pas d'éditeur riche |
| Redirections après changement de slug | Non (YAGNI) — avertissement dans l'éditeur si fiche publiée |

## Approche retenue

Migration complète en BDD + re-prerender à la demande (approche A).
Alternatives écartées : prerender au déploiement uniquement (contredit
l'exigence SEO), réécriture du fichier JS + rebuild complet (build de
plusieurs minutes, divergence git en prod).

## 1. Données et API

### Table `providers`

Créée automatiquement au démarrage si absente (même mécanisme que `reviews`
dans `app.js`). Si la table est vide, elle est seedée depuis
`src/models/providersSeed.js` — copie côté serveur des données actuelles de
`client/src/data/providersData.js` (les 8 fournisseurs, avec leurs chemins
de logos `/img/providers/*.png` existants). Le fichier client est ensuite
supprimé (cf. section 2).

```sql
CREATE TABLE providers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(200) NOT NULL UNIQUE,       -- [a-z0-9-], auto-généré depuis le nom
  name VARCHAR(200) NOT NULL,
  full_name VARCHAR(255),
  logo_url VARCHAR(500),
  tagline VARCHAR(500),
  category VARCHAR(100),
  description JSON,                         -- array de paragraphes (texte brut)
  offers JSON,                              -- array de { label, description }
  pros JSON,                                -- array de strings
  cons JSON,                                -- array de strings
  profiles JSON,                            -- array de strings
  published TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Endpoints

Publics :
- `GET /api/providers` — fournisseurs publiés, triés par `sort_order`
- `GET /api/providers/:slug` — un fournisseur publié, 404 sinon

Admin (derrière `requireAuth`, validations express-validator, pattern
`articleController`) :
- `GET /api/admin/providers` — liste complète
- `POST /api/admin/providers` — création
- `PUT /api/admin/providers/:id` — modification
- `DELETE /api/admin/providers/:id` — suppression (confirmation côté UI)
- `PATCH /api/admin/providers/:id/toggle` — publié/masqué
- `PATCH /api/admin/providers/reorder` — nouvel ordre (liste d'ids)
- `GET /api/admin/prerender/status` — état de la file de régénération

Un module partagé `src/models/providerModel.js` porte les requêtes SQL
(création de table, seed, lectures/écritures) ; il est utilisé par le
contrôleur, le démarrage de l'app et la lib prerender.

### Validation

- `name` obligatoire ; `slug` format `[a-z0-9-]`, unique
- Listes nettoyées côté serveur : entrées vides ignorées, strings trimmées
- Erreurs 422 `{ errors: [{ path, msg }] }` affichées en français dans le formulaire

## 2. Pages publiques et flux de données

`GuideIndex.jsx` et `ProviderPage.jsx` ne lisent plus `providersData.js`
(fichier supprimé après migration) mais l'API, avec cette logique :

1. Au premier rendu, si `window.__VOLTEA_DATA__` contient les données
   (page prérendue), démarrage **synchrone** avec elles → hydratation
   identique au HTML prérendu, zéro flash, zéro warning.
2. Sinon (navigation SPA), fetch vers `/api/providers[/:slug]` avec un
   squelette de chargement discret.
3. 404 API → rendu du composant NotFound existant.

Le rendu visuel des fiches ne change pas : mêmes sections (header/hero,
breadcrumb, présentation, offres, points forts/vigilance, profils, CTA),
mêmes meta SEO par fiche (title/description depuis tagline + première phrase
de description). `ProviderLogo` (fallback initiales) conservé tel quel.

`scripts/fetch-provider-logos.mjs` devient obsolète pour les nouveaux
fournisseurs (logos via upload admin) ; les logos existants dans
`/img/providers/` restent servis tels quels.

## 3. Interface admin

### Liste — `/admin/fournisseurs`

Nouvelle entrée « Fournisseurs » dans `AdminSidebar`. Tableau : logo
miniature, nom, catégorie, toggle publié cliquable, flèches ↑↓ (ordre),
actions modifier / voir la fiche / supprimer (avec confirmation).

### Éditeur — `/admin/fournisseurs/nouveau` et `/admin/fournisseurs/:id/modifier`

Un seul composant (pattern `ArticleEditor`), pensé pour un utilisateur non
technique :

- Champs simples : nom, nom complet, slogan, catégorie (liste déroulante
  Historique / Alternatif / Vert & Indépendant + saisie libre)
- Logo : upload avec aperçu immédiat (endpoint `/api/admin/upload` existant,
  WebP avec transparence préservée) ou conservation de l'existant
- Slug : auto-généré depuis le nom ; modifiable, avec avertissement si la
  fiche est déjà publiée (l'ancienne URL rendra 404)
- Description : une zone de texte par paragraphe, boutons « + Ajouter un
  paragraphe » / supprimer
- Offres : lignes « intitulé + description courte » avec +/-
- Points forts / Points de vigilance : deux listes de puces avec +/-
- Profils cibles : cases à cocher (TPE, PME, ETI, Industrie…) + ajout libre
- Boutons « Enregistrer en brouillon » / « Publier »
- Après enregistrement : bandeau d'état de la régénération SEO
  (« Page en cours de régénération… » → « Page à jour » / erreur), alimenté
  par polling de `/api/admin/prerender/status`

## 4. Pipeline prerender et SEO

### Lib partagée

La logique de `client/scripts/prerender.mjs` (mini-serveur statique,
snapshot Playwright, écriture `dist/<route>/index.html`) part dans un module
commun (CommonJS, importable par le script ESM et par le serveur ; Playwright
est résolu depuis `client/node_modules`). Deux consommateurs :

- le script de build (toutes les routes)
- le service de régénération à la demande (une route à la fois)

Deux ajouts :

- Le mini-serveur statique répond à `/api/providers*` en interrogeant
  **directement MySQL** via le pool existant — aucun backend démarré requis,
  ni au build ni à la demande. La logique « créer table + seed si vide » est
  partagée avec le démarrage de l'app (ordre build/démarrage indifférent au
  premier déploiement).
- Après snapshot, injection de `<script>window.__VOLTEA_DATA__ = {...}</script>`
  avant le bundle dans le HTML écrit (cf. section 2).

### Service de régénération à la demande

`src/services/prerenderService.js` : file d'attente en mémoire, une page à
la fois, routes en attente dédoublonnées, statut par route
(pending/running/done/error + timestamp).

Déclencheurs (depuis le contrôleur providers) :
- Création / modification / republication → régénère `/guide-energie/<slug>`
  + `/guide-energie` (liste)
- Suppression / masquage → supprime `dist/guide-energie/<slug>/index.html`
  + régénère la liste
- Réordonnancement → régénère la liste

Garanties :
- Écriture atomique (fichier temporaire puis renommage)
- Invalidation du cache HTML en mémoire d'Express : le `HTML_CACHE` actuel
  de `app.js` est déplacé dans un module partagé (`src/services/htmlCache.js`)
  avec `get`/`invalidate`
- **Dégradation gracieuse** : si Chromium échoue, l'enregistrement n'est pas
  bloqué — la fiche fonctionne via shell + API, seul le HTML statique pour
  robots reste daté ; le bandeau admin signale l'erreur, le détail est loggé

### Routing Express et sitemap

- `PROVIDER_SLUGS` / `PROVIDER_ROUTES` disparaissent de `src/config/routes.js`
- `app.js` : `/guide-energie/:slug` devient une route dynamique vérifiée en
  BDD (pattern `/actualites/:slug`) — fiche publiée → HTML prérendu (ou
  shell) en 200 ; inconnue/masquée → 404 avec la page NotFound prérendue
- Sitemap : les routes fournisseurs viennent de la BDD (fiches publiées,
  priorité 0.7, changefreq monthly)
- Build : la liste des routes fournisseurs vient de la BDD ; si elle est
  injoignable, le build prérend le reste et **avertit** au lieu d'échouer
  (la régénération à la demande comblera)

## 5. Cas limites

- **Changement de slug** : ancien fichier prérendu supprimé, ancienne URL en
  404 ; pas de 301 automatique (YAGNI) ; avertissement dans l'éditeur
- **XSS** : contenu en texte brut rendu via React (échappement natif), pas de
  `dangerouslySetInnerHTML`
- **Premier déploiement** : seed automatique → les 8 fiches sont dans le
  dashboard immédiatement, le rendu public est inchangé

## 6. Vérification avant livraison

- Les 8 fiches migrées identiques au pixel près (captures d'écran avant/après)
- CRUD complet testé dans le dashboard (création, modif de chaque type de
  champ, toggle, réordonnancement, suppression)
- HTML prérendu régénéré vérifié via `curl` après une modif admin
- Sitemap à jour après ajout/suppression
- 404 propre après suppression d'une fiche
- Console navigateur sans warning d'hydratation sur `/guide-energie` et les fiches
