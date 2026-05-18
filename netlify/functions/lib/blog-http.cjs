'use strict';

function corsHeaders(event, methods = 'GET, POST, PUT, DELETE, OPTIONS') {
  const origin = event.headers?.origin || event.headers?.Origin || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': methods,
  };
}

function jsonResponse(event, statusCode, body) {
  return {
    statusCode,
    headers: { ...corsHeaders(event), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

function parseJsonBody(event) {
  let raw = event.body ?? '{}';
  if (event.isBase64Encoded && raw) {
    raw = Buffer.from(raw, 'base64').toString('utf8');
  }
  return JSON.parse(raw);
}

module.exports = { corsHeaders, jsonResponse, parseJsonBody };
