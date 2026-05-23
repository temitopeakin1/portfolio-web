import { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  production: false,
  ai: { endpoint: '/api/chat' },
  copilot: { visitsEndpoint: '/api/copilot/visits' },
  blog: {
    postsEndpoint: '/api/blog/posts',
    adminLoginEndpoint: '/api/admin/login',
    adminBlogEndpoint: '/api/admin/blog',
  },
};
