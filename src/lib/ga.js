'use strict';

const pool = require('../config/database');

// In-memory cache so each request doesn't re-hit MySQL for the same value.
// reloadGaId() is called on boot and from settingsController whenever the
// admin updates the ID, so no TTL is needed.
let cachedGaId = null;

async function reloadGaId() {
  try {
    const [rows] = await pool.execute(
      "SELECT `value` FROM settings WHERE `key` = 'ga_measurement_id' LIMIT 1"
    );
    const raw = rows[0] && rows[0].value;
    cachedGaId = raw && /^G-[A-Z0-9]+$/.test(raw) ? raw : null;
  } catch (err) {
    console.error('[ga] reload failed:', err.message);
  }
  return cachedGaId;
}

function getGaId() {
  return cachedGaId;
}

// gtag.js with Consent Mode v2:
// - analytics_storage defaults to 'denied' so no cookies/hits before consent
// - if a prior 'accepted' is in localStorage we update consent immediately on
//   page load (no flicker, no wait for the banner to mount)
// - CookieBanner calls gtag('consent','update',...) when the user clicks Accepter
function buildGtagSnippet(gaId) {
  return `<script>
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
try{if(localStorage.getItem('cookieConsent')==='accepted'){gtag('consent','update',{analytics_storage:'granted'});}}catch(e){}
gtag('js',new Date());
gtag('config','${gaId}',{anonymize_ip:true});
</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>`;
}

module.exports = { getGaId, reloadGaId, buildGtagSnippet };
