import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../shared/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HttpClientModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  model = {
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  };

  submitted = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

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

 submitForm(): void {

  //Contraseñas
  if (this.model.password !== this.model.confirmPassword) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      background: 'linear-gradient(135deg, var(--blue), var(--blue-dark))',
      text: 'Las contraseñas no coinciden'
    });
    return;
  }

  //Términos
  if (!this.model.agreeTerms) {
    Swal.fire({
      icon: 'warning',
      title: 'Atención',
      text: 'Debes aceptar los términos y condiciones'
    });
    return;
  }

  //Campos vacíos
  if (!this.model.email || !this.model.password) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos incompletos',
      text: 'Rellena todos los campos'
    });
    return;
  }

  //Email válido
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(this.model.email)) {
    Swal.fire({
      icon: 'error',
      title: 'Email inválido',
      text: 'Introduce un correo válido'
    });
    return;
  }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(
      this.model.fullName,
      this.model.email,
      this.model.password,
      this.model.phone
    ).subscribe({
   next: (response) => {
      this.loading = false;

      Swal.fire({
        title: '¡Más cerca de los tuyos!',
        html: `
          <p>Registro completado correctamente.</p>
          <small>Ya puedes gestionar tus envíos con una experiencia logística confiable, organizada y segura.</small>
        `,
        icon: 'success',
        background: 'linear-gradient(135deg, var(--blue), var(--blue-dark))',
        color: '#e2e8f0',
        confirmButtonText: 'Ir al login',
        confirmButtonColor: '#22c55e',
        timer: 3500,
        timerProgressBar: true,
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
        }
      }).then(() => {
        this.router.navigate(['/login']);
      });
    },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.error || 'Error al registrarse. Intenta de nuevo.';
        console.error('Error de registro:', error);
          if (error.status === 409) {
          Swal.fire({
            icon: 'error',
            title: 'Usuario existente',
            text: 'Este correo ya está registrado'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo crear la cuenta'
          });
      }}
      
    });
  }
}