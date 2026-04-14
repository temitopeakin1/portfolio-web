import { AiEnvironmentConfig } from './environment.model';

/**
 * Build for static hosting on Namecheap: `npm run build:namecheap`
 *
 * 1. Deploy this repo on Netlify (functions only is fine). Copy your site URL.
 * 2. Set `netlifyChatBaseUrl` below to that origin (no trailing slash).
 * 3. In Netlify → Site settings → Environment variables:
 *    - OPENAI_API_KEY (required)
 *    - ALLOWED_ORIGIN = https://your-namecheap-domain.com (match your live site exactly)
 */
const netlifyChatBaseUrl = 'https://YOUR-SITE.netlify.app';

export const environment: AiEnvironmentConfig = {
  production: true,
  ai: {
    endpoint: `${netlifyChatBaseUrl}/.netlify/functions/chat`,
  },
};
