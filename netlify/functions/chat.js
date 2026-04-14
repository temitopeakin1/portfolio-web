'use strict';

const { handleChatRequest } = require('./lib/chat-core.cjs');

function corsHeaders() {
  const origin = (process.env.ALLOWED_ORIGIN || '*').trim();
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

function withCors(resultHeaders) {
  return { ...corsHeaders(), ...(resultHeaders || {}) };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: withCors({ 'Content-Type': 'text/plain' }),
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
      headers: withCors({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ error: 'Invalid JSON' }),
    };
  }

  const result = await handleChatRequest(body);
  return {
    statusCode: result.statusCode,
    headers: withCors(result.headers),
    body: result.body,
  };
};
