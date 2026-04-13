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
  protected currentYear = new Date().getFullYear();
  protected readonly clockDateDisplay = signal('');
  protected readonly clockDisplay = signal('');
  protected readonly clockIso = signal('');

  constructor() {
    const tickClock = () => {
      const d = new Date();
      this.clockDateDisplay.set(
        d.toLocaleDateString(undefined, {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
      );
      this.clockDisplay.set(
        d.toLocaleTimeString(undefined, {
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }),
      );
      this.clockIso.set(d.toISOString());
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
}
