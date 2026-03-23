import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  pillars = [
    {
      title: 'Confianza',
      text: 'Trabajamos para que cada cliente sienta seguridad desde que entrega su mercancía.'
    },
    {
      title: 'Servicio cercano',
      text: 'Nos enfocamos en acompañar y orientar durante todo el proceso logístico.'
    },
    {
      title: 'Soluciones reales',
      text: 'Diseñamos servicios para personas, familias y negocios con necesidades concretas.'
    }
  ];
}