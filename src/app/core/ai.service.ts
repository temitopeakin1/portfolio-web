import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment';

export type AiRole = 'system' | 'user' | 'assistant';

export interface AiChatMessage {
  role: AiRole;
  content: string;
}

export interface AskAiInput {
  question: string;
  context: string;
  history?: AiChatMessage[];
}

export interface AskAiResult {
  answer: string;
  provider: 'openai-compatible' | 'fallback';
}

interface ChatApiResponse {
  content?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class AiService {
  constructor(private readonly http: HttpClient) {}

  private aiFailureMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'I could not reach the AI service right now. Please try again.';
    }
    if (error.status === 0) {
      return 'The AI request did not reach the server. Run `npm start` (starts the app and the local `/api/chat` server), or check that OPENAI_API_KEY is set in `.env` for local development.';
    }
    if (error.status === 401) {
      return 'The AI key was rejected by the upstream API. Check OPENAI_API_KEY in `.env` or Netlify environment variables.';
    }
    if (error.status === 400) {
      const body = error.error as ChatApiResponse | undefined;
      if (body?.error) {
        return body.error;
      }
      return 'The chat request was rejected. Try sending a shorter message.';
    }
    if (error.status === 404) {
      return 'The chat API was not found. Use `npm start` for development. For production, deploy the Netlify function and keep `ai.endpoint` as `/.netlify/functions/chat`.';
    }
    if (error.status === 502 || error.status === 503) {
      return 'The chat helper server is not responding. If you use `ng serve` alone, run `node dev-chat-server.mjs` in another terminal, or use `npm start`.';
    }
    if (error.status >= 500) {
      const body = error.error as ChatApiResponse | undefined;
      if (body?.error) {
        return `The AI service returned an error: ${body.error}`;
      }
      return 'The AI service had a server error. Please try again in a moment.';
    }
    return 'I could not reach the AI service right now. Please try again.';
  }

  async ask(input: AskAiInput): Promise<AskAiResult> {
    const endpoint = environment.ai.endpoint.trim();

    if (!endpoint) {
      return {
        answer: 'AI is not configured yet. Set `ai.endpoint` in environment settings.',
        provider: 'fallback',
      };
    }

    if (endpoint.includes('api.openai.com')) {
      return {
        answer:
          'Configure `ai.endpoint` to `/api/chat` locally or `/.netlify/functions/chat` in production — the browser cannot call OpenAI directly.',
        provider: 'fallback',
      };
    }

    const history = (input.history ?? []).filter(
      (m): m is AiChatMessage & { role: 'user' | 'assistant' } =>
        m.role === 'user' || m.role === 'assistant'
    );

    const messages: { role: 'user' | 'assistant'; content: string }[] = [
      { role: 'user', content: `Portfolio context:\n${input.context}` },
      ...history,
    ];

    const last = messages[messages.length - 1];
    if (
      !last ||
      last.role !== 'user' ||
      last.content.trim() !== input.question.trim()
    ) {
      messages.push({ role: 'user', content: input.question });
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    try {
      const response = await firstValueFrom(
        this.http.post<ChatApiResponse>(
          endpoint,
          { messages },
          { headers }
        )
      );

      const answer = response.content?.trim();
      if (!answer) {
        return {
          answer: 'No answer came back from the model. Try asking again or shortening your question.',
          provider: 'fallback',
        };
      }
      return {
        answer,
        provider: 'openai-compatible',
      };
    } catch (error) {
      if (!environment.production && error instanceof HttpErrorResponse) {
        console.error('[Tmegha AI bot]', error.status, error.message, error.error);
      }
      return {
        answer: this.aiFailureMessage(error),
        provider: 'fallback',
      };
    }
  }
}
