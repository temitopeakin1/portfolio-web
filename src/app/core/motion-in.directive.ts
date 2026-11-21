import { afterNextRender, DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import gsap from 'gsap';
import { registerGsapPlugins } from './gsap-setup';

/**
 * Soft rise-in for a heading, card, or block. Siblings with the same
 * attribute stagger. Elements that are not on screen yet wait until scroll.
 */
@Directive({
  selector: '[appMotion]',
  standalone: true,
})
export class MotionInDirective {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      registerGsapPlugins();
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      const host = this.el.nativeElement;
      if (host.getClientRects().length === 0) {
        return;
      }

      const siblings = host.parentElement
        ? [...host.parentElement.querySelectorAll(':scope > [appMotion]')]
        : [host];
      const index = Math.max(0, siblings.indexOf(host));
      const delay = Math.min(index, 5) * 0.07;

      const ctx = gsap.context(() => {
        gsap.from(host, {
          y: 16,
          autoAlpha: 0,
          duration: 0.65,
          delay,
          ease: 'power3.out',
          clearProps: 'transform',
          scrollTrigger: {
            trigger: host,
            start: 'top 92%',
            once: true,
          },
        });
      }, host);

      this.destroyRef.onDestroy(() => ctx.revert());
    });
  }
}
