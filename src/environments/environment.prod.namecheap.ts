import { AiEnvironmentConfig } from './environment.model';

const netlifyChatBaseUrl = 'https://temitopeakinmegha.netlify.app'
  .trim()
  .replace(/\/+$/, '');

export const environment: AiEnvironmentConfig = {
  production: true,
  ai: {
    endpoint: `${netlifyChatBaseUrl}/.netlify/functions/chat`,
  },
};
