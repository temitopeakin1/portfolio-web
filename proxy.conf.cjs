/**
 * Dev: browser POSTs same-origin `/api/chat` → local dev-chat-server (Next-style route).
 */
module.exports = {
  '/api/chat': {
    target: 'http://127.0.0.1:3847',
    secure: false,
    changeOrigin: true,
  },
};
