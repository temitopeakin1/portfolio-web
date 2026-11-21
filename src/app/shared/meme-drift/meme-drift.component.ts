import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';

interface MemePhrase {
  label: string;
  emoji: string;
}

const PHRASES: readonly MemePhrase[] = [
  { label: 'npm install && pray', emoji: '🙏' },
  { label: '99 little bugs in the code', emoji: '🐛' },
  { label: "We don't cook beans here", emoji: '🍲' },
  { label: 'it works on my machine', emoji: '💻' },
  { label: 'Never deploy on a Friday', emoji: '🚀' },
  { label: 'npm install && pray', emoji: '🙏' },
  { label: 'who pushed to main', emoji: '👀' },
  { label: 'this should be a quick fix', emoji: '⚡' },
  { label: 'git blame has entered the chat', emoji: '🕵️' },
  { label: 'undefined is my emotional state', emoji: '🫥' },
  { label: 'refactor? not in this economy', emoji: '💸' },
  { label: 'it was working five minutes ago', emoji: '⏳' },
  { label: 'I have no idea why this works', emoji: '🧙' },
  { label: 'accidentally built a distributed system', emoji: '🌐' },
  { label: 'works until you update dependencies', emoji: '📦' },
  { label: 'one does not simply merge to main', emoji: '💍' },
  { label: 'the database knows too much', emoji: '🗄️' },
  { label: 'approved, ship it', emoji: '🚢' },
  { label: 'We don’t cook beans here', emoji: '🍲' },
];

const VISIBLE_MS = 4000;
const LEAVE_MS = 320;
const FIRST_DELAY_MS = 6000;
const QUIET_MS = 16000;
const INTERACTION_GAP_MS = 12000;
const MAX_INTERACTION_TOASTS = 3;

function isAdminPath(url: string): boolean {
  const path = url.split('?')[0].split('#')[0];
  return path === '/admin' || path.startsWith('/admin/');
}

@Component({
  selector: 'app-meme-drift',
  standalone: true,
  templateUrl: './meme-drift.component.html',
  styleUrl: './meme-drift.component.css',
})
export class MemeDriftComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly motionOk =
    typeof window === 'undefined' ||
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  private readonly onAdmin = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => isAdminPath(event.urlAfterRedirects)),
    ),
    {
      initialValue:
        (typeof location !== 'undefined' && isAdminPath(location.pathname)) ||
        isAdminPath(this.router.url),
    },
  );

  protected readonly toast = signal<MemePhrase | null>(null);
  protected readonly leaving = signal(false);

  private nextTimer = 0;
  private hideTimer = 0;
  private lastLabel = '';
  private lastShownAt = 0;
  private interactionShows = 0;

  constructor() {
    effect(() => {
      if (this.onAdmin()) {
        this.dismissNow();
        return;
      }
      if (this.motionOk && !this.nextTimer && !this.hideTimer) {
        this.schedule(FIRST_DELAY_MS);
      }
    });

    if (!this.motionOk || typeof document === 'undefined') {
      return;
    }

    const onInteract = () => {
      if (this.onAdmin() || this.toast() || this.interactionShows >= MAX_INTERACTION_TOASTS) {
        return;
      }
      if (Date.now() - this.lastShownAt < INTERACTION_GAP_MS) {
        return;
      }
      this.interactionShows += 1;
      this.present();
    };

    document.addEventListener('pointerdown', onInteract, true);

    this.destroyRef.onDestroy(() => {
      document.removeEventListener('pointerdown', onInteract, true);
      this.clearTimers();
    });
  }

  private present(): void {
    window.clearTimeout(this.nextTimer);
    this.nextTimer = 0;
    if (this.onAdmin()) {
      this.schedule(QUIET_MS);
      return;
    }

    this.leaving.set(false);
    this.toast.set(this.pick());
    this.lastShownAt = Date.now();
    window.clearTimeout(this.hideTimer);
    this.hideTimer = window.setTimeout(() => this.beginLeave(), VISIBLE_MS);
  }

  private beginLeave(): void {
    this.leaving.set(true);
    this.hideTimer = window.setTimeout(() => {
      this.toast.set(null);
      this.leaving.set(false);
      this.schedule(QUIET_MS + Math.random() * 6000);
    }, LEAVE_MS);
  }

  private schedule(delay: number): void {
    window.clearTimeout(this.nextTimer);
    this.nextTimer = window.setTimeout(() => this.present(), delay);
  }

  private dismissNow(): void {
    this.clearTimers();
    this.toast.set(null);
    this.leaving.set(false);
  }

  private clearTimers(): void {
    window.clearTimeout(this.nextTimer);
    window.clearTimeout(this.hideTimer);
    this.nextTimer = 0;
    this.hideTimer = 0;
  }

  private pick(): MemePhrase {
    let index = Math.floor(Math.random() * PHRASES.length);
    if (PHRASES.length > 1 && PHRASES[index].label === this.lastLabel) {
      index = (index + 1) % PHRASES.length;
    }
    this.lastLabel = PHRASES[index].label;
    return PHRASES[index];
  }
}
