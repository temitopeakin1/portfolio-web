import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  DOCUMENT,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, forkJoin, take, timer } from 'rxjs';

const MIN_VISIBLE_MS = 2500;
const EXIT_MS = 1000;

@Component({
  selector: 'app-preloader',
  standalone: true,
  templateUrl: './preloader.component.html',
  styleUrl: './preloader.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreloaderComponent {
  private readonly doc = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly exiting = signal(false);
  readonly done = signal(false);

  constructor() {
    const body = this.doc.body;
    body.style.overflow = 'hidden';

    forkJoin([
      this.router.events.pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        take(1),
      ),
      timer(MIN_VISIBLE_MS),
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.exiting.set(true);
        window.setTimeout(() => {
          this.done.set(true);
          body.style.overflow = '';
        }, EXIT_MS);
      });

    this.destroyRef.onDestroy(() => {
      body.style.overflow = '';
    });
  }
}
