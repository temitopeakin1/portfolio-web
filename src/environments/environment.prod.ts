import { AiEnvironmentConfig } from './environment.model';

export const environment: AiEnvironmentConfig = {
  production: true,
  ai: {
    endpoint: '/.netlify/functions/chat',
  },
};
