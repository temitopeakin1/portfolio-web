import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminAuthService } from '../../core/blog/admin-auth.service';

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
          this.error.set('Cannot reach the API. Stop npm start and run it again so dev-api-server is running.');
        } else if (err.status === 500) {
          this.error.set(String(err.error?.error || 'Server is not configured for admin login.'));
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
