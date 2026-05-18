'use strict';

const { jsonResponse, parseJsonBody } = require('./blog-http.cjs');
const { signToken, verifyPassword, requireAdmin, normalizeEnv } = require('./admin-auth.cjs');
const store = require('./blog-store.cjs');

async function handleBlogPosts(event) {
  if (event.httpMethod !== 'GET') return jsonResponse(event, 405, { error: 'Method not allowed' });
  const slug = event.queryStringParameters?.slug;
  if (slug) {
    const post = await store.getPostBySlug(slug);
    if (!post) return jsonResponse(event, 404, { error: 'Post not found' });
    return jsonResponse(event, 200, post);
  }
  const posts = await store.listPosts();
  return jsonResponse(event, 200, { posts: posts.map(({ content: _c, ...s }) => s) });
}

async function handleAdminLogin(event) {
  if (event.httpMethod !== 'POST') return jsonResponse(event, 405, { error: 'Method not allowed' });
  try {
    if (!normalizeEnv(process.env.ADMIN_PASSWORD)) {
      return jsonResponse(event, 500, {
        error: 'ADMIN_PASSWORD is not set on the server. Add it to your .env file and restart npm start.',
      });
    }
    const body = parseJsonBody(event);
    if (!verifyPassword(body.password)) return jsonResponse(event, 401, { error: 'Invalid password' });
    return jsonResponse(event, 200, { token: signToken() });
  } catch (err) {
    return jsonResponse(event, 500, { error: err?.message || 'Login failed' });
  }
}

async function handleAdminBlog(event) {
  if (!requireAdmin(event)) return jsonResponse(event, 401, { error: 'Unauthorized' });
  const slugParam = event.queryStringParameters?.slug;
  try {
    if (event.httpMethod === 'GET') {
      return jsonResponse(event, 200, { posts: await store.listPosts() });
    }
    if (event.httpMethod === 'POST') {
      const body = parseJsonBody(event);
      return jsonResponse(event, 201, { post: await store.createPost(body.post || body) });
    }
    if (event.httpMethod === 'PUT') {
      const body = parseJsonBody(event);
      const slug = slugParam || body.slug;
      if (!slug) return jsonResponse(event, 400, { error: 'slug is required' });
      return jsonResponse(event, 200, { post: await store.updatePost(slug, body.post || body) });
    }
    if (event.httpMethod === 'DELETE') {
      if (!slugParam) return jsonResponse(event, 400, { error: 'slug is required' });
      await store.deletePost(slugParam);
      return jsonResponse(event, 200, { ok: true });
    }
    return jsonResponse(event, 405, { error: 'Method not allowed' });
  } catch (err) {
    const msg = err?.message || 'Request failed';
    return jsonResponse(event, msg.includes('not found') ? 404 : 400, { error: msg });
  }
}

module.exports = { handleBlogPosts, handleAdminLogin, handleAdminBlog };
