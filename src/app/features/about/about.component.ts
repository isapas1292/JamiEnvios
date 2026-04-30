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
  valores = [
    {
      title: 'Orgullo de origen',
      text: 'Llevamos nuestra identidad con dignidad y trabajo.'
    },
    {
      title: 'Confianza',
      text: 'Sabemos el valor emocional y económico de cada envío.'
    },
    {
      title: 'Responsabilidad',
      text: 'Cumplimos con seriedad y disciplina.'
    },
    {
      title: 'Progreso',
      text: 'Cada envío puede representar crecimiento para una familia o negocio.'
    },
    {
      title: 'Cercanía',
      text: 'Tratamos al cliente como parte de nuestra comunidad.'
    }
  ];
}