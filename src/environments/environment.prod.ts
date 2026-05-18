import { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  production: true,
  ai: { endpoint: '/.netlify/functions/chat' },
  blog: {
    postsEndpoint: '/.netlify/functions/blog-posts',
    adminLoginEndpoint: '/.netlify/functions/admin-login',
    adminBlogEndpoint: '/.netlify/functions/admin-blog',
  },
};
