import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let pluginsRegistered = false;

/** Call once at app startup (e.g. from `main.ts`). Safe to call multiple times. */
export function registerGsapPlugins(): void {
  if (pluginsRegistered || typeof window === 'undefined') {
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  pluginsRegistered = true;
}

export { ScrollTrigger };
