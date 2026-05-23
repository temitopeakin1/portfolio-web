import { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  production: true,
  ai: { endpoint: '/.netlify/functions/chat' },
  copilot: { visitsEndpoint: '/.netlify/functions/copilot-visits' },
  blog: {
    postsEndpoint: '/.netlify/functions/blog-posts',
    adminLoginEndpoint: '/.netlify/functions/admin-login',
    adminBlogEndpoint: '/.netlify/functions/admin-blog',
  },
};
