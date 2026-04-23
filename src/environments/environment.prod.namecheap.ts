import { AiEnvironmentConfig } from './environment.model';

/**
 * Build for static hosting on Namecheap: `npm run build:namecheap`
 *
 * 1. Deploy this repo on Netlify (functions only is fine). Copy your site URL.
 * 2. Set `netlifyChatBaseUrl` below to that origin (no trailing slash).
 * 3. In Netlify → Site settings → Environment variables:
 *    - OPENAI_API_KEY (required)
 *    - ALLOWED_ORIGINS = comma-separated list of exact browser origins, e.g.
 *      https://yourdomain.com,https://www.yourdomain.com
 *      (must match how visitors open the site: scheme + host + no path; no trailing slash)
 */
const netlifyChatBaseUrl = 'https://temitopeakinmegha.netlify.app'
  .trim()
  .replace(/\/+$/, '');

export const environment: AiEnvironmentConfig = {
  production: true,
  ai: {
    endpoint: `${netlifyChatBaseUrl}/.netlify/functions/chat`,
  },
};
