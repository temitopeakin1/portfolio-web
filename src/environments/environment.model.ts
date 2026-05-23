export interface AppEnvironment {
  production: boolean;
  ai: { endpoint: string; model?: string };
  copilot: { visitsEndpoint: string };
  blog: {
    postsEndpoint: string;
    adminLoginEndpoint: string;
    adminBlogEndpoint: string;
  };
}

export type AiEnvironmentConfig = AppEnvironment;
