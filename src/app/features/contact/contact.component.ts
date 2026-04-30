import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ContactService } from '../../shared/services/contact.service';
import Swal from 'sweetalert2';

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

  constructor(private contactService: ContactService) { }

  submitForm(): void {
    this.loading = true;
    this.errorMessage = '';

    this.contactService.sendContactForm(this.model)
      .subscribe({
        next: (response) => {
          this.loading = false;
          console.log('Respuesta:', response);
          // Limpiar el formulario
          this.model = {
            name: '',
            email: '',
            phone: '',
            service: '',
            message: ''
          };
          
          Swal.fire({
            title: '¡Solicitud enviada!',
            text: 'La solicitud se mandó correctamente. Nos pondremos en contacto contigo pronto.',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#e02424'
          });
        },
        error: (error) => {
          this.loading = false;
          console.error('Error:', error);
          this.errorMessage = 'Error al enviar la solicitud. Por favor, intenta nuevamente.';
          
          Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al enviar tu solicitud. Intenta de nuevo más tarde.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#e02424'
          });
        }
      });
  }
}
