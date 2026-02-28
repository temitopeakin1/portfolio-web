import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact.component.html',
})
export class ContactComponent {
  protected name = '';
  protected email = '';
  protected message = '';
  protected submitted = false;

  onSubmit(): void {
    this.submitted = true;
    // In a real app, you would send this to a backend or email service
  }
}
