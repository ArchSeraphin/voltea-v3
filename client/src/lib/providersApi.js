// Accès aux données fournisseurs côté client.
//
// Sur une page prérendue, src/services/prerenderLib.js a sérialisé les données
// dans window.__VOLTEA_DATA__ (script injecté avant le bundle) : le premier
// rendu React est alors synchrone et identique au HTML prérendu — zéro flash,
// zéro warning d'hydratation. En navigation SPA, fetch classique vers l'API.
// Les fetchs republient dans window.__VOLTEA_DATA__ : c'est ce que le
// prerender lit pour fabriquer l'injection.

function publishBootstrap(patch) {
  if (typeof window === 'undefined') return;
  window.__VOLTEA_DATA__ = { ...(window.__VOLTEA_DATA__ || {}), ...patch };
}

export function getBootstrapProviders() {
  if (typeof window === 'undefined') return null;
  return window.__VOLTEA_DATA__?.providers || null;
}

export function getBootstrapProvider(slug) {
  if (typeof window === 'undefined') return null;
  const provider = window.__VOLTEA_DATA__?.provider;
  return provider && provider.slug === slug ? provider : null;
}

export async function fetchProviders() {
  const res = await fetch('/api/providers');
  if (!res.ok) throw new Error('Erreur de chargement des fournisseurs');
  const data = await res.json();
  publishBootstrap({ providers: data.providers });
  return data.providers;
}

// Renvoie null si le fournisseur n'existe pas ou n'est pas publié (404 API).
export async function fetchProvider(slug) {
  const res = await fetch(`/api/providers/${encodeURIComponent(slug)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Erreur de chargement du fournisseur');
  const provider = await res.json();
  publishBootstrap({ provider });
  return provider;
}
