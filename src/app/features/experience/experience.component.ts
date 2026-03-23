import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.css'
})
export class ExperienceComponent {
  metrics = [
    {
      value: '20 - 25 días',
      label: 'Tiempo estimado desde la salida del contenedor'
    },
    {
      value: '1 salida mensual',
      label: 'Frecuencia aproximada del servicio marítimo'
    },
    {
      value: 'Atención cercana',
      label: 'Acompañamiento y asesoría durante todo el proceso'
    }
  ];

  principles = [
    {
      title: 'Seguridad',
      text: 'Buscamos proteger la mercancía y dar tranquilidad al cliente.'
    },
    {
      title: 'Responsabilidad',
      text: 'Cuidamos tiempos, organización y cumplimiento en la operación.'
    },
    {
      title: 'Atención personalizada',
      text: 'El cliente cuenta con orientación y soporte en cada etapa.'
    }
  ];
}