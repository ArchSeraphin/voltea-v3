'use strict';

const pool = require('../config/database');

const ALLOWED_KEYS = ['ga_measurement_id'];

async function getPublicSettings(req, res) {
  try {
    const placeholders = ALLOWED_KEYS.map(() => '?').join(', ');
    const [rows] = await pool.execute(
      `SELECT \`key\`, \`value\` FROM settings WHERE \`key\` IN (${placeholders})`,
      ALLOWED_KEYS
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

    // Build object with all allowed keys (null if not set)
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

  // Validate ga_measurement_id format
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
