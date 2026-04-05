import {
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  inject,
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

  constructor() {
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
