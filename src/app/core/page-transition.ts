import gsap from 'gsap';

/** Routed component host element(s) live alongside `<router-outlet>` inside this wrapper. */
export function getRoutedHostElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.children).filter(
    (el): el is HTMLElement =>
      el instanceof HTMLElement && el.tagName.toLowerCase() !== 'router-outlet'
  );
}

export function animatePageEnter(host: HTMLElement): gsap.core.Tween | null {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.set(host, { clearProps: 'all' });
    return null;
  }

  gsap.killTweensOf(host);
  return gsap.fromTo(
    host,
    { opacity: 0, y: 14 },
    {
      opacity: 1,
      y: 0,
      duration: 0.45,
      ease: 'power2.out',
      clearProps: 'transform',
    }
  );
}
