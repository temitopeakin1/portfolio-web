import 'dotenv/config';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { handleChatRequest } = require('./netlify/functions/lib/chat-core.cjs');
const { corsHeaders } = require('./netlify/functions/lib/blog-http.cjs');
const { handleBlogPosts, handleAdminLogin, handleAdminBlog } = require('./netlify/functions/lib/blog-handlers.cjs');
const { handleCopilotVisits } = require('./netlify/functions/lib/copilot-visits-handlers.cjs');

const PORT = Number(process.env.PORT_CHAT_API || 3847);

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function toEvent(req, body) {
  const url = new URL(req.url || '/', `http://localhost`);
  return {
    httpMethod: req.method,
    headers: req.headers,
    queryStringParameters: Object.fromEntries(url.searchParams),
    body: body ?? null,
    isBase64Encoded: false,
  };
}

const server = createServer(async (req, res) => {
  const path = new URL(req.url || '/', 'http://localhost').pathname;

  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders(toEvent(req, null)));
    res.end();
    return;
  }

  try {
    if (req.method === 'POST' && path === '/api/chat') {
      const raw = await readBody(req);
      const result = await handleChatRequest(JSON.parse(raw || '{}'));
      res.writeHead(result.statusCode, result.headers);
      res.end(result.body);
      return;
    }
    if (path === '/api/copilot/visits') {
      const result = await handleCopilotVisits(toEvent(req, null));
      res.writeHead(result.statusCode, result.headers);
      res.end(result.body);
      return;
    }
    if (path === '/api/blog/posts') {
      const result = await handleBlogPosts(toEvent(req, null));
      res.writeHead(result.statusCode, result.headers);
      res.end(result.body);
      return;
    }
    if (path === '/api/admin/login' && req.method === 'POST') {
      const result = await handleAdminLogin(toEvent(req, await readBody(req)));
      res.writeHead(result.statusCode, result.headers);
      res.end(result.body);
      return;
    }
    if (path === '/api/admin/blog') {
      const body = ['GET', 'DELETE'].includes(req.method) ? null : await readBody(req);
      const result = await handleAdminBlog(toEvent(req, body));
      res.writeHead(result.statusCode, result.headers);
      res.end(result.body);
      return;
    }
    res.writeHead(404);
    res.end('Not Found');
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[dev-api-server] http://127.0.0.1:${PORT}`);
  if (!process.env.ADMIN_PASSWORD?.trim()) {
    console.warn('[dev-api-server] WARNING: ADMIN_PASSWORD is missing from .env — admin login will fail.');
  } else {
    console.log('[dev-api-server] Admin login: /api/admin/login');
  }
});
