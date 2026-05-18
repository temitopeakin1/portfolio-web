'use strict';

const crypto = require('node:crypto');

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

function normalizeEnv(value) {
  const trimmed = String(value || '').trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function getSecret() {
  return normalizeEnv(process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD);
}

function signToken() {
  const secret = getSecret();
  if (!secret) throw new Error('ADMIN_PASSWORD is not configured');
  const payload = { role: 'admin', exp: Date.now() + TOKEN_TTL_MS };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verifyToken(token) {
  const secret = getSecret();
  if (!secret || !token) return false;
  const [body, sig] = String(token).split('.');
  if (!body || !sig) return false;
  const expected = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  if (sig.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    return payload.role === 'admin' && payload.exp > Date.now();
  } catch {
    return false;
  }
}

function verifyPassword(password) {
  const expected = normalizeEnv(process.env.ADMIN_PASSWORD);
  if (!expected) return false;
  const a = Buffer.from(String(password));
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function requireAdmin(event) {
  const header = event.headers?.authorization || event.headers?.Authorization || '';
  const match = String(header).match(/^Bearer\s+(.+)$/i);
  return verifyToken(match?.[1]?.trim());
}

module.exports = { signToken, verifyPassword, requireAdmin, normalizeEnv };
