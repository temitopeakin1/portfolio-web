import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment';

const SESSION_KEY = 'tmegha-copilot-visit-recorded';

interface VisitCountResponse {
  count?: number;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class CopilotVisitsService {
  constructor(private readonly http: HttpClient) {}

  private endpoint(): string {
    return environment.copilot.visitsEndpoint.trim();
  }

  async fetchCount(): Promise<number | null> {
    const url = this.endpoint();
    if (!url) {
      return null;
    }
    try {
      const res = await firstValueFrom(
        this.http.get<VisitCountResponse>(url)
      );
      return typeof res.count === 'number' && res.count >= 0 ? res.count : null;
    } catch {
      return null;
    }
  }

  /** Records one visit per browser session when the chat UI is opened. */
  async recordSessionVisit(): Promise<number | null> {
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SESSION_KEY)) {
      return this.fetchCount();
    }

    const url = this.endpoint();
    if (!url) {
      return null;
    }

    try {
      const res = await firstValueFrom(
        this.http.post<VisitCountResponse>(url, {})
      );
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(SESSION_KEY, '1');
      }
      return typeof res.count === 'number' && res.count >= 0 ? res.count : null;
    } catch {
      return this.fetchCount();
    }
  }
}
