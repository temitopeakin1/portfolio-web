import {
  Directive,
  ElementRef,
  DestroyRef,
  afterNextRender,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import gsap from 'gsap';
import { registerGsapPlugins } from './gsap-setup';

/**
 * Reveals the host element on scroll (GSAP ScrollTrigger).
 * Usage: <section appScrollReveal>…</section>
 */
@Directive({
  selector: '[appScrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  /** e.g. 'top 85%', 'top bottom' */
  readonly scrollStart = input<string>('top 85%');
  /** If true, animation runs only the first time the trigger fires */
  readonly revealOnce = input(true);
  /** Initial vertical offset in px */
  readonly revealY = input(24, { transform: numberAttribute });
  readonly duration = input(0.65, { transform: numberAttribute });
  readonly delay = input(0, { transform: numberAttribute });

  constructor() {
    afterNextRender(() => {
      registerGsapPlugins();

      if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      const host = this.el.nativeElement;

      const ctx = gsap.context(() => {
        const once = this.revealOnce();
        gsap.from(host, {
          opacity: 0,
          y: this.revealY(),
          duration: this.duration(),
          delay: this.delay(),
          ease: 'power2.out',
          scrollTrigger: {
            trigger: host,
            start: this.scrollStart(),
            once,
            ...(once ? {} : { toggleActions: 'play none play reverse' as const }),
          },
        });
      }, host);

      this.destroyRef.onDestroy(() => {
        ctx.revert();
      });
    });
  }
}
