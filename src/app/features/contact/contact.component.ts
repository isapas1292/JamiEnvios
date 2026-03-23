import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  submitted = false;

  submitForm(): void {
    this.submitted = true;
    console.log('Formulario enviado:', this.model);
  }
}