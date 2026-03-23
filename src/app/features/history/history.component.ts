import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent {
  timeline = [
    {
      year: '2005',
      title: 'Nacimiento del proyecto',
      text: 'El proyecto inicia originalmente en Santo Domingo, República Dominicana.'
    },
    {
      year: '2012',
      title: 'Inicio de operaciones España - RD',
      text: 'Se empieza a operar dentro del mercado de paquetería y transporte de mercancías desde España.'
    },
    {
      year: 'Evolución',
      title: 'Crecimiento del servicio',
      text: 'La empresa fue expandiendo el tipo de mercancías enviadas y consolidando su presencia en la ruta.'
    },
    {
      year: 'Hoy',
      title: 'Empresa consolidada',
      text: 'JAMI se posiciona como una empresa con trayectoria y experiencia en este mercado.'
    }
  ];
}