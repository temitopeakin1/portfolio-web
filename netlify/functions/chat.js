'use strict';

const { handleChatRequest } = require('./lib/chat-core.cjs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid JSON' }),
    };
  }

  const result = await handleChatRequest(body);
  return {
    statusCode: result.statusCode,
    headers: result.headers,
    body: result.body,
  };
};
