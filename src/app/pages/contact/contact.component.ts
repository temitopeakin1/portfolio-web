import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { FORMSPREE_ENDPOINT } from '../../core/formspree.config';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact.component.html',
})
export class ContactComponent {
  constructor(private readonly http: HttpClient) {}

  protected name = '';
  protected email = '';
  protected message = '';
  protected submitted = false;
  protected submitAttempted = false;
  protected submitting = false;
  protected submitError = '';

  async onSubmit(form: NgForm): Promise<void> {
    this.submitAttempted = true;
    this.submitError = '';

    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    if (!FORMSPREE_ENDPOINT) {
      this.submitError = 'Form submission is not configured yet. Add your Formspree endpoint in formspree.config.ts.';
      return;
    }

    this.submitting = true;

    try {
      await firstValueFrom(
        this.http.post(
          FORMSPREE_ENDPOINT,
          {
            name: this.name,
            email: this.email,
            message: this.message,
          },
          {
            headers: {
              Accept: 'application/json',
            },
          }
        )
      );

      this.submitted = true;
      form.resetForm();
    } catch {
      this.submitError = 'Something went wrong while sending your message. Please try again.';
    } finally {
      this.submitting = false;
    }
  }
}
