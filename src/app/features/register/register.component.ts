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

 submitForm(): void {

  //Contraseñas
  if (this.model.password !== this.model.confirmPassword) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
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
        title: '¡Bienvenido a Jami Envíos!',
        html: `
          <p>Tu cuenta ha sido creada correctamente.</p>
          <small>Ya puedes empezar a gestionar tus envíos</small>
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