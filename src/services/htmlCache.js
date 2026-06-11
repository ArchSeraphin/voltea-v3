'use strict';

// Cache mémoire du HTML servi par le fallback SPA d'app.js. Extrait dans un
// module pour que le service de re-prerender puisse invalider une entrée
// quand il réécrit un fichier dans dist/ (sinon Express servirait l'ancienne
// version jusqu'au prochain redémarrage Passenger).

const fs = require('fs');

const cache = new Map();

function readHtmlCached(file) {
  let html = cache.get(file);
  if (html === undefined) {
    html = fs.readFileSync(file, 'utf8');
    cache.set(file, html);
  }
  return html;
}

function invalidate(file) {
  cache.delete(file);
}

module.exports = { readHtmlCached, invalidate };
