import {
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ThemeService } from '../core/theme.service';
import { ScrollTrigger } from '../core/gsap-setup';
import { animatePageEnter, getRoutedHostElements } from '../core/page-transition';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent {
  protected readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  readonly pageRoot = viewChild<ElementRef<HTMLElement>>('pageRoot');

  protected menuOpen = false;
  private aboutHeroImagePrefetchAdded = false;
  protected currentYear = new Date().getFullYear();
  protected readonly clockDateDisplay = signal('');
  protected readonly clockDisplay = signal('');
  protected readonly clockIso = signal('');

  constructor() {
    const tickClock = () => {
      const d = new Date();
      this.clockDateDisplay.set(
        d.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
      );
      this.clockDisplay.set(
        new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
          timeZoneName: 'short',
        }).format(d),
      );
      const y = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const h = String(d.getHours()).padStart(2, '0');
      const mi = String(d.getMinutes()).padStart(2, '0');
      const s = String(d.getSeconds()).padStart(2, '0');
      this.clockIso.set(`${y}-${mo}-${day}T${h}:${mi}:${s}`);
    };
    tickClock();
    const clockId = window.setInterval(tickClock, 1000);
    this.destroyRef.onDestroy(() => clearInterval(clockId));

    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        afterNextRender(
          () => {
            const root = this.pageRoot()?.nativeElement;
            if (!root) return;
            const hosts = getRoutedHostElements(root);
            const host = hosts[hosts.length - 1];
            if (!host) return;
            animatePageEnter(host);
            requestAnimationFrame(() => ScrollTrigger.refresh());
          },
          { injector: this.injector },
        );
      });
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  protected prefetchAboutHeroImage(): void {
    if (this.aboutHeroImagePrefetchAdded || typeof document === 'undefined') return;
    this.aboutHeroImagePrefetchAdded = true;
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'image';
    link.href = 'assets/images/about-image.svg';
    document.head.appendChild(link);
  }
}
