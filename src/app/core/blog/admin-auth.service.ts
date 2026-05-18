import { Injectable, computed, inject, signal } from '@angular/core';
import { BlogApiService } from './blog-api.service';

const TOKEN_KEY = 'portfolio-admin-token';

function decodeBase64Url(value: string): string {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
  return atob(base64 + pad);
}

export function isAdminTokenValid(token: string | null): boolean {
  if (!token) return false;
  try {
    const [body] = token.split('.');
    if (!body) return false;
    const payload = JSON.parse(decodeBase64Url(body)) as { role?: string; exp?: number };
    return payload.role === 'admin' && typeof payload.exp === 'number' && payload.exp > Date.now();
  } catch {
    return false;
  }
}

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly api = inject(BlogApiService);
  private readonly token = signal<string | null>(this.readStoredToken());

  readonly isAuthenticated = computed(() => isAdminTokenValid(this.token()));

  constructor() {
    if (!this.isAuthenticated() && sessionStorage.getItem(TOKEN_KEY)) {
      this.logout();
    }
  }

  getToken(): string | null {
    return this.isAuthenticated() ? this.token() : null;
  }

  async login(password: string): Promise<void> {
    const token = await this.api.adminLogin(password);
    sessionStorage.setItem(TOKEN_KEY, token);
    this.token.set(token);
  }

  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    this.token.set(null);
  }

  private readStoredToken(): string | null {
    const stored = sessionStorage.getItem(TOKEN_KEY);
    return isAdminTokenValid(stored) ? stored : null;
  }
}
