import { AppEnvironment } from './environment.model';

const base = 'https://temitopeakinmegha.netlify.app'.replace(/\/+$/, '');

export const environment: AppEnvironment = {
  production: true,
  ai: { endpoint: `${base}/.netlify/functions/chat` },
  blog: {
    postsEndpoint: `${base}/.netlify/functions/blog-posts`,
    adminLoginEndpoint: `${base}/.netlify/functions/admin-login`,
    adminBlogEndpoint: `${base}/.netlify/functions/admin-blog`,
  },
};
