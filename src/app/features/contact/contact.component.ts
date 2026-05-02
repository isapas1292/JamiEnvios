import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  // ✅ Prefijo por defecto
  selectedCode = '+34';

  // ✅ Listado de regiones para el Dropbox
  countryCodes = [
    { code: '+34', flag: '🇪🇸', name: 'España' },
    { code: '+1', flag: '🇩🇴', name: 'Rep. Dominicana' },
    { code: '+1', flag: '🇺🇸', name: 'USA' },
    { code: '+1', flag: '🇵🇷', name: 'Puerto Rico' },
    { code: '+52', flag: '🇲🇽', name: 'México' },
    { code: '+57', flag: '🇨🇴', name: 'Colombia' },
    { code: '+54', flag: '🇦🇷', name: 'Argentina' },
    { code: '+56', flag: '🇨🇱', name: 'Chile' },
    { code: '+51', flag: '🇵🇪', name: 'Perú' },
    { code: '+58', flag: '🇻🇪', name: 'Venezuela' },
    { code: '+593', flag: '🇪🇨', name: 'Ecuador' },
    { code: '+506', flag: '🇨🇷', name: 'Costa Rica' },
    { code: '+507', flag: '🇵🇦', name: 'Panamá' },
    { code: '+502', flag: '🇬🇹', name: 'Guatemala' },
    { code: '+503', flag: '🇸🇻', name: 'El Salvador' },
    { code: '+504', flag: '🇭🇳', name: 'Honduras' },
    { code: '+505', flag: '🇳🇮', name: 'Nicaragua' },
    { code: '+591', flag: '🇧🇴', name: 'Bolivia' },
    { code: '+595', flag: '🇵🇾', name: 'Paraguay' },
    { code: '+598', flag: '🇺🇾', name: 'Uruguay' },
    { code: '+44', flag: '🇬🇧', name: 'Reino Unido' },
    { code: '+49', flag: '🇩🇪', name: 'Alemania' },
    { code: '+33', flag: '🇫🇷', name: 'Francia' },
    { code: '+39', flag: '🇮🇹', name: 'Italia' },
    { code: '+351', flag: '🇵🇹', name: 'Portugal' }
  ];

  loading = false;
  errorMessage = '';

  constructor(private contactService: ContactService) { }

  submitForm(): void {
    // ❌ Validación de campos obligatorios
    if (!this.model.name || !this.model.email || !this.model.service || !this.model.message) {
      this.showAlert('warning', 'Faltan datos', 'Por favor, llena los campos requeridos.');
      return;
    }

    // 📧 Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.model.email)) {
      this.showAlert('error', 'Correo inválido', 'Introduce un correo electrónico válido.');
      return;
    }

    // 📱 Validar teléfono (solo números, entre 7 y 15 dígitos)
    const phoneRegex = /^[0-9]{7,15}$/;
    if (this.model.phone && !phoneRegex.test(this.model.phone)) {
      this.showAlert('error', 'Número inválido', 'El teléfono debe contener solo números (7-15 dígitos).');
      return;
    }

    this.loading = true;

    // 🔗 Clonamos el modelo para no modificar el input visualmente mientras se envía
    const dataToSend = { 
      ...this.model, 
      phone: this.model.phone ? `${this.selectedCode} ${this.model.phone}` : 'No provisto' 
    };

    this.contactService.sendContactForm(dataToSend).subscribe({
      next: () => {
        this.loading = false;
        this.resetForm();
        this.showAlert('success', '¡Solicitud enviada!', 'Nos pondremos en contacto contigo pronto.');
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        this.showAlert('error', 'Error', 'Hubo un problema al enviar. Intenta más tarde.');
      }
    });
  }

  private resetForm() {
    this.model = { name: '', email: '', phone: '', service: '', message: '' };
    this.selectedCode = '+34';
  }

  private showAlert(icon: any, title: string, text: string) {
    Swal.fire({ icon, title, text, confirmButtonColor: '#e02424' });
  }
}