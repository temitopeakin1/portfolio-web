'use strict';

const fs = require('node:fs');
const path = require('node:path');

const STORE_KEY = 'stats';
const DATA_FILE = path.join(process.cwd(), 'data', 'copilot-visits.json');
const BLOB_STORE_NAME = 'copilot-visits';

function isNetlify() {
  return Boolean(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

function initBlobsFromEvent(event) {
  if (!isNetlify() || !event?.blobs) return;
  try {
    const { connectLambda } = require('@netlify/blobs');
    connectLambda(event);
  } catch (err) {
    console.error('[copilot-visits-store] connectLambda failed:', err?.message || err);
  }
}

function readLocal() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify({ count: 0 }, null, 2));
      return 0;
    }
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    return Number.isFinite(data?.count) ? Math.max(0, Math.floor(data.count)) : 0;
  } catch {
    return 0;
  }
}

function writeLocal(count) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify({ count }, null, 2));
}

function getBlobStore() {
  if (!isNetlify()) return null;
  const { getStore } = require('@netlify/blobs');
  const siteID = process.env.SITE_ID || process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_BLOB_READ_WRITE_TOKEN;
  const opts = { name: BLOB_STORE_NAME };
  if (siteID && token) {
    opts.siteID = siteID;
    opts.token = token;
  }
  try {
    return getStore(opts);
  } catch (err) {
    console.error('[copilot-visits-store] getStore failed:', err?.message || err);
    return null;
  }
}

async function readCountFromBlobStore(store) {
  const data = await store.get(STORE_KEY, { type: 'json' });
  if (data && Number.isFinite(data.count)) {
    return Math.max(0, Math.floor(data.count));
  }
  try {
    await store.setJSON(STORE_KEY, { count: 0 });
  } catch (err) {
    console.error('[copilot-visits-store] blob seed write failed:', err?.message || err);
  }
  return 0;
}

async function getVisitCount() {
  if (isNetlify()) {
    try {
      const store = getBlobStore();
      if (store) return await readCountFromBlobStore(store);
    } catch (err) {
      console.error('[copilot-visits-store] blob read failed:', err?.message || err);
    }
    return 0;
  }
  return readLocal();
}

async function saveVisitCount(count) {
  const safe = Math.max(0, Math.floor(count));
  if (isNetlify()) {
    const store = getBlobStore();
    if (!store) {
      throw new Error('Visit counter storage is unavailable. Redeploy on Netlify and try again.');
    }
    await store.setJSON(STORE_KEY, { count: safe });
    return safe;
  }
  writeLocal(safe);
  return safe;
}

async function incrementVisitCount() {
  const next = (await getVisitCount()) + 1;
  return saveVisitCount(next);
}

module.exports = {
  initBlobsFromEvent,
  getVisitCount,
  incrementVisitCount,
};
