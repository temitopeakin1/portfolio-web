import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminAuthService } from '../../core/blog/admin-auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './admin-login.component.html',
})
export class AdminLoginComponent implements OnInit {
  private readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = this.fb.nonNullable.group({ password: ['', Validators.required] });

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) void this.navigateAfterLogin();
  }

  private navigateAfterLogin(): Promise<boolean> {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const target =
      returnUrl && returnUrl.startsWith('/admin') && !returnUrl.startsWith('/admin/login')
        ? returnUrl
        : '/admin/blog';
    return this.router.navigateByUrl(target);
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid || this.submitting()) return;
    this.submitting.set(true);
    this.error.set(null);
    try {
      await this.auth.login(this.form.controls.password.value);
      await this.navigateAfterLogin();
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 0) {
          this.error.set(
            environment.production
              ? 'Cannot reach the admin API. Check that Netlify Functions are deployed.'
              : 'Cannot reach the API. Stop npm start and run it again so dev-api-server is running.'
          );
        } else if (err.status === 500) {
          const serverMsg = String(err.error?.error || '');
          if (environment.production && serverMsg.includes('ADMIN_PASSWORD')) {
            this.error.set(
              'Admin password is not configured on Netlify. Open Site configuration → Environment variables, add ADMIN_PASSWORD (same value as your local .env), scope Functions or All, then trigger a new deploy.'
            );
          } else {
            this.error.set(serverMsg || 'Server is not configured for admin login.');
          }
        } else if (err.status === 401) {
          this.error.set('Invalid password.');
        } else {
          this.error.set(String(err.error?.error || err.message));
        }
      } else {
        this.error.set('Login failed. Restart npm start and try again.');
      }
    } finally {
      this.submitting.set(false);
    }
  }
}
