'use strict';

const { handleChatRequest } = require('./lib/chat-core.cjs');

/**
 * Comma-separated list in ALLOWED_ORIGINS, or single ALLOWED_ORIGIN (legacy).
 * Browser sends `Origin: https://www.example.com` — that string must be listed
 * if not using `*`. Listing both apex and www avoids status 0 (CORS) failures.
 */
function normalizeOriginUrl(value) {
  return String(value || '')
    .trim()
    .replace(/\/+$/, '')
    .toLowerCase();
}

function parseAllowedOriginsList() {
  const raw = (
    process.env.ALLOWED_ORIGINS ||
    process.env.ALLOWED_ORIGIN ||
    '*'
  ).trim();
  if (!raw || raw === '*') {
    return ['*'];
  }
  return raw
    .split(',')
    .map((s) => s.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}

function pickAccessControlAllowOrigin(event) {
  const allowed = parseAllowedOriginsList();
  if (allowed.includes('*')) {
    return '*';
  }
  const requestOrigin =
    event.headers?.origin || event.headers?.Origin || '';
  if (!requestOrigin) {
    return allowed[0] || '*';
  }
  if (allowed.includes(requestOrigin)) {
    return requestOrigin;
  }
  const nReq = normalizeOriginUrl(requestOrigin);
  for (const entry of allowed) {
    if (normalizeOriginUrl(entry) === nReq) {
      return requestOrigin;
    }
  }
  return null;
}

function corsHeaders(event) {
  const allowOrigin = pickAccessControlAllowOrigin(event);
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
  if (allowOrigin) {
    headers['Access-Control-Allow-Origin'] = allowOrigin;
  }
  return headers;
}

function withCors(event, resultHeaders) {
  return { ...corsHeaders(event), ...(resultHeaders || {}) };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(event), body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: withCors(event, { 'Content-Type': 'text/plain' }),
      body: 'Method Not Allowed',
    };
  }

  let body;
  try {
    let raw = event.body ?? '{}';
    if (event.isBase64Encoded && raw) {
      raw = Buffer.from(raw, 'base64').toString('utf8');
    }
    body = JSON.parse(raw);
  } catch {
    return {
      statusCode: 400,
      headers: withCors(event, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({ error: 'Invalid JSON' }),
    };
  }

  const result = await handleChatRequest(body);
  return {
    statusCode: result.statusCode,
    headers: withCors(event, result.headers),
    body: result.body,
  };
};
