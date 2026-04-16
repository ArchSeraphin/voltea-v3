# Voltea v3 — Évolutions client (design spec)

**Date :** 2026-04-16  
**Stack :** React (Vite) + Node.js/Express + MySQL  

---

## 1. Suppression de la mention "Collectivités"

### Objectif
Le client ne travaille pas avec le secteur public. Toute référence aux collectivités doit être retirée du site.

### Fichiers concernés

| Fichier | Modification |
|---|---|
| `client/src/components/Header.jsx` | Retirer `{ to: '/collectivites', label: 'Collectivités' }` du tableau `NAV_LINKS` |
| `client/src/App.jsx` | Supprimer l'import `Collectivites` et la `<Route path="/collectivites">` ; mettre à jour le champ `description` du schema JSON-LD (retirer "collectivités") |
| `client/src/pages/Home.jsx` | Retirer "copropriétés et collectivités" dans la section "Reprenez le contrôle" (ligne ~119) ; mettre à jour la balise SEO `description` |
| `client/src/pages/Collectivites.jsx` | Conserver le fichier mais le transformer en redirect vers `/` pour éviter toute erreur résiduelle |

La route `/collectivites` devient un 404 naturel une fois retirée de `App.jsx`.

---

## 2. Navigation — Ajout de "Comprendre le marché"

### Objectif
Ajouter un lien de navigation principale pointant vers la nouvelle page `/marche-energie`.

### Position dans la nav
```
Qui sommes nous | Nos services | Comprendre le marché | Actus
```

### Fichiers concernés

| Fichier | Modification |
|---|---|
| `client/src/components/Header.jsx` | Ajouter `{ to: '/marche-energie', label: 'Comprendre le marché' }` dans `NAV_LINKS`, après "Nos services" |
| `client/src/App.jsx` | Ajouter `<Route path="/marche-energie" element={<MarketPage />} />` et l'import correspondant |

---

## 3. Guide Énergie / Fiches Fournisseurs

### Objectif
Créer un guide pédagogique sur les fournisseurs d'énergie, inspiré du standard du marché (Alliance des Énergies et équivalents), avec contenu reformulé et personnalisé au positionnement Voltea.

### Architecture des routes

```
/guide-energie                  → Index : grille de tous les fournisseurs
/guide-energie/:slug            → Fiche fournisseur (composant générique)
```

### Fournisseurs couverts (v1)

| Slug | Fournisseur |
|---|---|
| `edf` | EDF |
| `engie` | Engie |
| `totalenergies` | TotalEnergies |
| `ekwateur` | Ekwateur |
| `primeo-energie` | Primeo Énergie |
| `vattenfall` | Vattenfall |
| `eni` | ENI |
| `alpiq` | Alpiq |

### Structure d'une fiche fournisseur

1. **Header** — logo officiel + nom + accroche courte
2. **Présentation** — positionnement marché, histoire courte (reformulé)
3. **Offres proposées** — cards : électricité, gaz, offres vertes, tarifs fixes/indexés
4. **Points forts / Points faibles** — liste visuelle (✓ / ✗)
5. **Pour quel profil ?** — TPE, PME, industrie, copropriété
6. **CTA Voltea** — "Besoin de comparer ? On négocie pour vous — contactez-nous"

### Implémentation

- `client/src/data/providersData.js` — fichier central avec toutes les données (slug, nom, logo URL, contenu structuré)
- `client/src/pages/GuideIndex.jsx` — grille des fournisseurs avec cards cliquables
- `client/src/pages/ProviderPage.jsx` — composant générique qui lit le slug depuis l'URL (`useParams`) et affiche la fiche
- Les logos sont chargés via URL externe (domaines officiels des fournisseurs) — pas de téléchargement local
- Contenu statique dans `providersData.js` — pas de base de données, pas d'admin nécessaire
- Routes dans `App.jsx` :
  ```jsx
  <Route path="/guide-energie" element={<GuideIndex />} />
  <Route path="/guide-energie/:slug" element={<ProviderPage />} />
  ```

---

## 4. Intégration GNews — Actualités marché

### Objectif
Agréger des actualités sur le marché de l'énergie et le courtage via l'API GNews. La clé API est gérée via le panneau admin. Les requêtes passent par le serveur Express (clé jamais exposée côté client).

### Backend

**Nouvelle route Express :** `GET /api/news`

Paramètres acceptés :
- `q` (query) — défaut : `"marché énergie OR courtage énergie OR électricité gaz"`
- `lang` — défaut : `fr`
- `max` — défaut : `9`, max : `10` (limite GNews free tier)

**Cache mémoire :**
- Objet Node `{ data, timestamp }` au niveau module dans le contrôleur
- TTL : 15 minutes
- Invalidé au redémarrage du serveur (acceptable)

**Clé API :**
- Stockée dans la table `settings` sous la clé `gnews_api_key`
- Lue à chaque requête via `settingsController` (avec cache)
- Si absente ou invalide → retourne `{ articles: [] }` sans erreur 500

**Fichiers backend :**

| Fichier | Action |
|---|---|
| `src/controllers/newsController.js` | Nouveau — logique fetch GNews + cache |
| `src/routes/api.js` | Ajouter `router.get('/news', apiLimiter, newsController.getNews)` |
| `src/controllers/settingsController.js` | Ajouter `gnews_api_key` aux champs publics (non exposé) et admin |

### Panneau Admin

- Ajouter le champ **"Clé API GNews"** (`gnews_api_key`) dans la page réglages existante
- Type `password` (masqué par défaut, affichable)
- Même pattern que `ga_measurement_id`

**Fichiers frontend admin :**

| Fichier | Action |
|---|---|
| `client/src/pages/admin/Dashboard.jsx` ou Settings | Ajouter le champ GNews API key |

### Frontend public

**Sur `Home.jsx` :**
- Nouvelle section "Actualités marché" avant le CTA final
- 3 articles GNews : card avec titre + source + date + lien externe (`target="_blank"`)
- Bouton "Toutes les actualités marché →" vers `/marche-energie`
- Si aucun article (clé absente) : section masquée silencieusement

**Nouvelle page `MarketPage.jsx` (`/marche-energie`) :**
- Hero court avec accroche sur le marché de l'énergie
- Flux GNews : 9 articles en grille, filtrables par thème ("Énergie", "Courtage", "Marchés")
- Bannière intermédiaire : "Comprendre les fournisseurs → Guide énergie" avec lien `/guide-energie`
- Pagination ou bouton "Charger plus" (si quota le permet)
- CTA bas de page : "Besoin d'un expert ? Contactez Voltea"

---

## Cohérence visuelle

Tous les nouveaux composants utilisent les classes CSS existantes du projet :
- `.section`, `.section--white`, `.section--light`
- `.container`, `.card`, `.btn`, `.btn-primary`, `.btn-outline`
- `.news-card`, `.news-card-img`, `.news-card-body` (réutilisés pour les articles GNews)
- `ScrollReveal` pour les animations d'entrée

---

## Ordre d'implémentation recommandé

1. Suppression "Collectivités" (5 min, nettoyage pur)
2. Ajout nav "Comprendre le marché" + squelette `MarketPage`
3. Backend GNews (contrôleur + route + admin)
4. Frontend GNews (Home section + MarketPage complet)
5. Guide énergie (données fournisseurs + GuideIndex + ProviderPage)
