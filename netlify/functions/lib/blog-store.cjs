'use strict';

const fs = require('node:fs');
const path = require('node:path');

const STORE_KEY = 'posts';
const DATA_FILE = path.join(process.cwd(), 'data', 'blog-posts.json');
const SEED_FILE = path.join(__dirname, 'blog-seed.json');

function isNetlify() {
  return Boolean(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

/** Wire Netlify Blobs from the Lambda event (required in Functions v2). */
function initBlobsFromEvent(event) {
  if (!isNetlify() || !event?.blobs) return;
  try {
    const { connectLambda } = require('@netlify/blobs');
    connectLambda(event);
  } catch (err) {
    console.error('[blog-store] connectLambda failed:', err?.message || err);
  }
}

function readSeed() {
  try {
    return JSON.parse(fs.readFileSync(SEED_FILE, 'utf8')).posts || [];
  } catch {
    return [];
  }
}

function readLocal() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const seed = readSeed();
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify({ posts: seed }, null, 2));
      return seed;
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')).posts || [];
  } catch {
    return readSeed();
  }
}

function writeLocal(posts) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify({ posts }, null, 2));
}

function getBlobStore() {
  if (!isNetlify()) return null;
  const { getStore } = require('@netlify/blobs');
  const siteID = process.env.SITE_ID || process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_BLOB_READ_WRITE_TOKEN;
  const opts = { name: 'blog-posts' };
  if (siteID && token) {
    opts.siteID = siteID;
    opts.token = token;
  }
  try {
    return getStore(opts);
  } catch (err) {
    console.error('[blog-store] getStore failed:', err?.message || err);
    return null;
  }
}

async function listPostsFromBlobStore(store) {
  const data = await store.get(STORE_KEY, { type: 'json' });
  if (data?.posts?.length) return data.posts;
  const seed = readSeed();
  try {
    await store.setJSON(STORE_KEY, { posts: seed });
  } catch (err) {
    console.error('[blog-store] blob seed write failed:', err?.message || err);
  }
  return seed;
}

async function listPosts() {
  if (isNetlify()) {
    try {
      const store = getBlobStore();
      if (store) return await listPostsFromBlobStore(store);
    } catch (err) {
      console.error('[blog-store] blob list failed:', err?.message || err);
    }
    return readSeed();
  }
  return readLocal();
}

async function savePosts(posts) {
  if (isNetlify()) {
    const store = getBlobStore();
    if (!store) {
      throw new Error('Blog storage is unavailable. Redeploy the site on Netlify and try again.');
    }
    await store.setJSON(STORE_KEY, { posts });
    return;
  }
  writeLocal(posts);
}

function slugify(v) {
  return String(v || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function normalizePost(input, existing) {
  const title = String(input.title || existing?.title || '').trim();
  const slug = slugify(input.slug || title || existing?.slug);
  const excerpt = String(input.excerpt || existing?.excerpt || '').trim();
  const content = String(input.content ?? existing?.content ?? '').trim();
  const date = String(input.date || existing?.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })).trim();
  const readTime = String(input.readTime || existing?.readTime || '5 min read').trim();
  const coverImage = String(input.coverImage ?? existing?.coverImage ?? '').trim();
  const subtitle = String(input.subtitle ?? existing?.subtitle ?? '').trim();
  if (!title || !slug || !excerpt || !content) throw new Error('title, excerpt, and content are required');
  return {
    id: String(input.id || existing?.id || slug),
    slug,
    title,
    excerpt,
    date,
    readTime,
    content,
    ...(coverImage ? { coverImage } : {}),
    ...(subtitle ? { subtitle } : {}),
  };
}

async function getPostBySlug(slug) {
  return (await listPosts()).find((p) => p.slug === slug);
}

async function createPost(input) {
  const posts = await listPosts();
  const post = normalizePost(input);
  if (posts.some((p) => p.slug === post.slug)) throw new Error('Slug already exists');
  posts.unshift(post);
  await savePosts(posts);
  return post;
}

async function updatePost(slug, input) {
  const posts = await listPosts();
  const i = posts.findIndex((p) => p.slug === slug);
  if (i === -1) throw new Error('Post not found');
  const updated = normalizePost({ ...input, slug: input.slug || slug }, posts[i]);
  if (updated.slug !== slug && posts.some((p) => p.slug === updated.slug)) throw new Error('Slug already exists');
  posts[i] = updated;
  await savePosts(posts);
  return updated;
}

async function deletePost(slug) {
  const posts = await listPosts();
  const next = posts.filter((p) => p.slug !== slug);
  if (next.length === posts.length) throw new Error('Post not found');
  await savePosts(next);
}

module.exports = {
  initBlobsFromEvent,
  listPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
};
