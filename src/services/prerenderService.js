'use strict';

// File de régénération du HTML prérendu, déclenchée par providerController
// après chaque modification dans le dashboard. Une page à la fois ; un échec
// n'est jamais bloquant pour l'enregistrement (dégradation gracieuse : la
// page reste servie via le shell SPA + API, seul le HTML statique date).

const prerenderLib = require('./prerenderLib');

const pending = [];
let running = false;
let current = null; // batch en cours de traitement (null si inactif)
let lastRun = null; // { state: 'done'|'error', routes, error, finishedAt }

function queueRegeneration(routes) {
  for (const route of routes) {
    if (!pending.includes(route)) pending.push(route);
  }
  processQueue();
}

async function processQueue() {
  if (running || pending.length === 0) return;
  running = true;
  const batch = pending.splice(0, pending.length);
  current = batch;
  try {
    const { failures } = await prerenderLib.prerenderRoutes(batch);
    lastRun = {
      state: failures.length > 0 ? 'error' : 'done',
      routes: batch,
      error: failures.length > 0
        ? failures.map((f) => `${f.route}: ${f.error}`).join(' ; ')
        : null,
      finishedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error('[prerender] régénération échouée:', err.message);
    lastRun = { state: 'error', routes: batch, error: err.message, finishedAt: new Date().toISOString() };
  } finally {
    current = null;
    running = false;
    if (pending.length > 0) processQueue();
  }
}

function removeRoute(route) {
  prerenderLib.removePrerenderedRoute(route).catch((err) => {
    console.error(`[prerender] suppression ${route} échouée:`, err.message);
  });
}

function getStatus() {
  return { running, current, pending: [...pending], lastRun };
}

module.exports = { queueRegeneration, removeRoute, getStatus };
