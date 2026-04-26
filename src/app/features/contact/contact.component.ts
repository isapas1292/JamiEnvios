import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ContactService } from '../../shared/services/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [ContactService],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  model = {
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  };

  loading = false;
  errorMessage = '';

  constructor(private contactService: ContactService) {}

  submitForm(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.contactService.sendContactForm(this.model)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Respuesta:', response);
          // Limpiar el formulario
          this.model = {
            name: '',
            email: '',
            phone: '',
            service: '',
            message: ''
          };
        },
        error: (error) => {
          console.error('Error:', error);
          this.errorMessage = 'Error al enviar la solicitud. Por favor, intenta nuevamente.';
        }
      });
  }
}
