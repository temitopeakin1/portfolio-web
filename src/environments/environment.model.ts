export interface AiEnvironmentConfig {
  production: boolean;
  ai: {
    /**
     * Same-origin chat API (POST JSON `{ messages }` → `{ content }`).
     * Dev: `/api/chat` (proxied to `dev-chat-server`). Prod: `/.netlify/functions/chat`.
     */
    endpoint: string;
    /** Unused for `/api/chat` flow (model is set on the server). */
    model?: string;
  };
}
