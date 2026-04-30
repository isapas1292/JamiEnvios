import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../shared/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  model = {
    email: '',
    password: '',
    rememberMe: false
  };

  submitted = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  submitForm(): void {
    if (!this.model.email || !this.model.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos'
      });
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.login(this.model.email, this.model.password).subscribe({
      next: (response) => {
        this.loading = false;
        
        Swal.fire({
          title: '¡Bienvenido!',
          text: 'Inicio de sesión exitoso. Redirigiendo...',
          icon: 'success',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/home']);
        });
      },
      error: (error) => {
        this.loading = false;
        console.error('Error de login:', error);
        
        if (error.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Credenciales incorrectas',
            text: 'El correo o la contraseña no coinciden'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error en el servidor. Intenta de nuevo más tarde.'
          });
        }
      }
    });
  }
}