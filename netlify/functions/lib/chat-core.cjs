'use strict';

const MAX_MESSAGES = 24;
const MAX_CONTENT_LENGTH = 4000;

const DEFAULT_UPSTREAM = 'https://api.chatanywhere.tech/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-3.5-turbo';

const PORTFOLIO_SYSTEM_PROMPT = `
You are "Tmegha AI bot" on Temitope Akinmegha's portfolio website.

Scope:
1) Questions about Temitope, this site, projects, experience, blog, or stack — prioritize the
   "Portfolio context" in the conversation. If something is not covered there, say so briefly
   and avoid inventing biographical or project details.
2) General software engineering, programming languages, tooling, algorithms, and system design —
   answer clearly and practically, like a senior engineer mentoring someone. You may use
   established industry knowledge; cite uncertainty when appropriate.

When the answer draws on portfolio-specific facts (experience, projects, stack, blog), end with a short line:
Sources: [name 1–3 relevant site areas, e.g. About, Projects → [name], Blog — only if truly relevant].
Omit the Sources line for purely general tech answers with no tie to this portfolio.

Tone: concise, friendly, and accurate. Prefer plain text; use short lines with "- " for bullets and fenced code blocks only when showing code.
`.trim();

/**
 * @param {unknown} raw
 * @returns {{ role: 'user' | 'assistant'; content: string }[]}
 */
function sanitizeMessages(raw) {
  if (!Array.isArray(raw)) return [];

  const out = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const role = item.role;
    const content = item.content;
    if (role !== 'user' && role !== 'assistant') continue;
    if (typeof content !== 'string') continue;
    const trimmed = content.trim();
    if (!trimmed) continue;
    out.push({
      role,
      content: trimmed.slice(0, MAX_CONTENT_LENGTH),
    });
  }
  return out.slice(-MAX_MESSAGES);
}

/**
 * @param {Record<string, unknown>} body parsed JSON body
 * @returns {Promise<{ statusCode: number; headers: Record<string, string>; body: string }>}
 */
async function handleChatRequest(body) {
  const safeBody = body && typeof body === 'object' ? body : {};
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing OpenAI API key' }),
    };
  }

  const sanitized = sanitizeMessages(safeBody.messages);

  if (sanitized.length === 0) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Send at least one user or assistant message.' }),
    };
  }

  const messages = [{ role: 'system', content: PORTFOLIO_SYSTEM_PROMPT }, ...sanitized];

  const upstream = (process.env.CHAT_UPSTREAM_URL || DEFAULT_UPSTREAM).trim();
  const model = (process.env.CHAT_MODEL || DEFAULT_MODEL).trim();

  try {
    const openaiRes = await fetch(upstream, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
      }),
    });

    const data = await openaiRes.json();

    if (!openaiRes.ok) {
      console.error('Chat upstream error:', data);
      return {
        statusCode: openaiRes.status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Upstream error', details: data }),
      };
    }

    const content = data.choices?.[0]?.message?.content ?? 'No response available';
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    };
  } catch (err) {
    console.error('Chat server error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to fetch from AI upstream' }),
    };
  }
}

module.exports = { handleChatRequest, sanitizeMessages, PORTFOLIO_SYSTEM_PROMPT };
