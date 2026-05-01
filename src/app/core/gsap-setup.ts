import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let pluginsRegistered = false;

export function registerGsapPlugins(): void {
  if (pluginsRegistered || typeof window === 'undefined') {
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  pluginsRegistered = true;
}

export { ScrollTrigger };
