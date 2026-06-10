#!/usr/bin/env node
// Prerender de build. Après `vite build`, crawle chaque route publique avec
// la lib partagée (src/services/prerenderLib.js) et écrit le HTML rendu dans
// dist/<route>/index.html. Les routes fournisseurs viennent de MySQL ; si la
// BDD est injoignable, on prérend le reste et on avertit (la régénération à
// la demande comblera après le premier enregistrement admin).

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

// dotenv DOIT précéder tout require qui importe (même transitivement)
// src/config/database.js : le pool mysql2 lit process.env à l'évaluation.
require('dotenv').config({ path: path.join(PROJECT_ROOT, '.env') });

const { STATIC_ROUTES } = require(path.join(PROJECT_ROOT, 'src', 'config', 'routes.js'));
const prerenderLib = require(path.join(PROJECT_ROOT, 'src', 'services', 'prerenderLib.js'));

async function main() {
  const routes = STATIC_ROUTES.map((r) => r.path);

  let dbOk = false;
  try {
    const providerModel = require(path.join(PROJECT_ROOT, 'src', 'models', 'providerModel.js'));
    await providerModel.ensureProvidersTable();
    const slugs = await providerModel.getPublishedSlugs();
    routes.push(...slugs.map((slug) => `/guide-energie/${slug}`));
    dbOk = true;
  } catch (err) {
    console.warn('[prerender] BDD injoignable — fiches fournisseurs non prérendues :', err.message);
  }

  const { okCount, failures } = await prerenderLib.prerenderRoutes(routes, { includeNotFound: true });
  console.log(`\n[prerender] ${okCount}/${routes.length} routes prerendered${dbOk ? '' : ' (sans fournisseurs)'}`);

  // process.exit explicite : le pool MySQL garde sinon le process vivant.
  process.exit(failures.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('[prerender] crashed:', err);
  process.exit(1);
});
