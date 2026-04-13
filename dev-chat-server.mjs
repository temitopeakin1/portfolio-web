/**
 * Local API that mirrors Next.js `app/api/chat/route.ts`: POST /api/chat
 * Run via `npm start` (with concurrently) or: `node dev-chat-server.mjs`
 *
 * Reads OPENAI_API_KEY from the environment (.env supported via dotenv).
 * Optional: CHAT_UPSTREAM_URL (default ChatAnywhere), CHAT_MODEL, PORT_CHAT_API.
 */
import 'dotenv/config';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { handleChatRequest } = require('./netlify/functions/lib/chat-core.cjs');

const PORT = Number(process.env.PORT_CHAT_API || 3847);

const server = createServer(async (req, res) => {
  if (req.method !== 'POST' || req.url !== '/api/chat') {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
    return;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');

  let body;
  try {
    body = JSON.parse(raw || '{}');
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid JSON' }));
    return;
  }

  const result = await handleChatRequest(body);
  res.writeHead(result.statusCode, result.headers);
  res.end(result.body);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[dev-chat-server] POST http://127.0.0.1:${PORT}/api/chat`);
});
