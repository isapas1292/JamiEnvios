import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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

  submitForm(): void {
    this.submitted = true;
    console.log('Login enviado:', this.model);
  }
}