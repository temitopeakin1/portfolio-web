import { afterNextRender, Component, DestroyRef, ElementRef, inject, Injector } from '@angular/core';
import { RouterLink } from '@angular/router';
import gsap from 'gsap';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private tiltEnabled = false;

  constructor() {
    afterNextRender(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.tiltEnabled =
        !reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (reduce) {
        return;
      }
      void this.playIntro();
    }, { injector: this.injector });
  }

  protected onCardMove(event: PointerEvent): void {
    if (!this.tiltEnabled) {
      return;
    }
    const wrap = event.currentTarget as HTMLElement;
    const card = wrap.querySelector('.hero-card') as HTMLElement | null;
    const glow = wrap.querySelector('.hero-card__glow') as HTMLElement | null;
    if (!card || !glow) {
      return;
    }
    const bounds = wrap.getBoundingClientRect();
    const px = (event.clientX - bounds.left) / bounds.width;
    const py = (event.clientY - bounds.top) / bounds.height;
    gsap.to(card, {
      rotateX: (0.5 - py) * 7,
      rotateY: (px - 0.5) * 9,
      transformPerspective: 900,
      duration: 0.45,
      ease: 'power2.out',
      overwrite: 'auto',
    });
    gsap.set(glow, { x: event.clientX - bounds.left, y: event.clientY - bounds.top });
    gsap.to(glow, { opacity: 1, duration: 0.25, overwrite: 'auto' });
  }

  protected onCardLeave(): void {
    if (!this.tiltEnabled) {
      return;
    }
    const wrap = this.host.nativeElement.querySelector('.hero-card-wrap') as HTMLElement | null;
    const card = wrap?.querySelector('.hero-card') as HTMLElement | null;
    const glow = wrap?.querySelector('.hero-card__glow') as HTMLElement | null;
    if (!card || !glow) {
      return;
    }
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.7,
      ease: 'power3.out',
      overwrite: 'auto',
    });
    gsap.to(glow, { opacity: 0, duration: 0.4, overwrite: 'auto' });
  }

  private async playIntro(): Promise<void> {
    await this.waitForPreloader();
    if (!this.host.nativeElement.isConnected) {
      return;
    }

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
      timeline
        .from('.hero-kicker', { y: 18, autoAlpha: 0, duration: 0.55 })
        .from('.hero-name', { y: 26, autoAlpha: 0, duration: 0.75 }, '-=0.32')
        .from('.hero-role', { y: 18, autoAlpha: 0, duration: 0.55 }, '-=0.48')
        .from('.hero-copy', { y: 14, autoAlpha: 0, duration: 0.5 }, '-=0.36')
        .from('.hero-actions a', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.45 }, '-=0.32')
        .from('.hero-card', { y: 22, autoAlpha: 0, duration: 0.7 }, '-=0.55')
        .from('.code-line', { x: 10, autoAlpha: 0, stagger: 0.055, duration: 0.35 }, '-=0.4');
    }, this.host.nativeElement);

    this.destroyRef.onDestroy(() => ctx.revert());
  }

  private waitForPreloader(): Promise<void> {
    const loader = document.querySelector('app-preloader .preloader');
    if (!loader) {
      return Promise.resolve();
    }
    if (loader.classList.contains('preloader--exiting')) {
      return this.delay(180);
    }
    return new Promise((resolve) => {
      const observer = new MutationObserver(() => {
        const current = document.querySelector('app-preloader .preloader');
        if (!current || current.classList.contains('preloader--exiting')) {
          observer.disconnect();
          void this.delay(180).then(resolve);
        }
      });
      observer.observe(document.body, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['class'],
      });
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }
}
