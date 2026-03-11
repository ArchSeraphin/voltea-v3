'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/database');

const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '7d';
const REFRESH_TOKEN_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000;

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateTokens(adminId, email) {
  const accessToken = jwt.sign(
    { id: adminId, email },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES }
  );
  const refreshToken = jwt.sign(
    { id: adminId, email },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES }
  );
  return { accessToken, refreshToken };
}

function setTokenCookies(res, accessToken, refreshToken) {
  const isProd = process.env.NODE_ENV === 'production';

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: REFRESH_TOKEN_EXPIRES_MS,
    path: '/api/auth',
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT id, email, password_hash FROM admins WHERE email = ? LIMIT 1',
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const admin = rows[0];
    const valid = await bcrypt.compare(password, admin.password_hash);

    if (!valid) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const { accessToken, refreshToken } = generateTokens(admin.id, admin.email);
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS);

    await pool.execute(
      'INSERT INTO refresh_tokens (token_hash, admin_id, expires_at) VALUES (?, ?, ?)',
      [tokenHash, admin.id, expiresAt]
    );

    setTokenCookies(res, accessToken, refreshToken);

    return res.json({ success: true, email: admin.email });
  } catch (err) {
    console.error('[auth/login]', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function refresh(req, res) {
  const refreshToken = req.cookies && req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Token de rafraîchissement manquant' });
  }

  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    return res.status(401).json({ error: 'Token de rafraîchissement invalide' });
  }

  const tokenHash = hashToken(refreshToken);

  try {
    const [rows] = await pool.execute(
      'SELECT id, admin_id, expires_at FROM refresh_tokens WHERE token_hash = ? LIMIT 1',
      [tokenHash]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Token de rafraîchissement introuvable' });
    }

    const storedToken = rows[0];
    if (new Date(storedToken.expires_at) < new Date()) {
      await pool.execute('DELETE FROM refresh_tokens WHERE id = ?', [storedToken.id]);
      return res.status(401).json({ error: 'Token de rafraîchissement expiré' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(payload.id, payload.email);
    const newHash = hashToken(newRefreshToken);
    const newExpiry = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS);

    await pool.execute('DELETE FROM refresh_tokens WHERE id = ?', [storedToken.id]);
    await pool.execute(
      'INSERT INTO refresh_tokens (token_hash, admin_id, expires_at) VALUES (?, ?, ?)',
      [newHash, payload.id, newExpiry]
    );

    setTokenCookies(res, accessToken, newRefreshToken);

    return res.json({ success: true });
  } catch (err) {
    console.error('[auth/refresh]', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function logout(req, res) {
  const refreshToken = req.cookies && req.cookies.refreshToken;

  if (refreshToken) {
    try {
      const tokenHash = hashToken(refreshToken);
      await pool.execute('DELETE FROM refresh_tokens WHERE token_hash = ?', [tokenHash]);
    } catch (err) {
      console.error('[auth/logout]', err);
    }
  }

  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('accessToken', { httpOnly: true, secure: isProd, sameSite: 'strict' });
  res.clearCookie('refreshToken', { httpOnly: true, secure: isProd, sameSite: 'strict', path: '/api/auth' });

  return res.status(204).end();
}

module.exports = { login, refresh, logout };
