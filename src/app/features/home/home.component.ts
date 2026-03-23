import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  values = [
    {
      icon: '✓',
      title: 'Seguridad',
      text: 'Tus envíos protegidos en cada paso de la cadena logística.',
      color: 'icon-blue'
    },
    {
      icon: '◉',
      title: 'Responsabilidad',
      text: 'Cumplimos con tiempos y cuidados para cada envío.',
      color: 'icon-red'
    },
    {
      icon: '◔',
      title: 'Atención personalizada',
      text: 'Te acompañamos y asesoramos en todo momento.',
      color: 'icon-yellow'
    }
  ];

  services = [
    {
      icon: '📦',
      title: 'Envío de Cajas y Paquetes',
      text: 'Transporte seguro y eficaz de todo tipo de cajas y paquetes.'
    },
    {
      icon: '🧰',
      title: 'Transporte de Motores',
      text: 'Especialistas en envío de motores y repuestos mecánicos.'
    },
    {
      icon: '🏠',
      title: 'Mudanzas Internacionales',
      text: 'Simplificamos el traslado de tus pertenencias al extranjero.'
    },
    {
      icon: '🚚',
      title: 'Servicio Puerta a Puerta',
      text: 'Recogemos y entregamos tus envíos donde lo necesites.'
    }
  ];

  sections = [
    {
      title: 'Sobre Nosotros',
      text: 'Conoce quiénes somos, qué hacemos y qué distingue a JamiEnvios.',
      link: '/nosotros'
    },
    {
      title: 'Historia',
      text: 'Descubre cómo nació el proyecto y cómo fue creciendo con los años.',
      link: '/historia'
    },
    {
      title: 'Servicios',
      text: 'Explora todas las soluciones de envío, mudanza y carga comercial.',
      link: '/servicios'
    },
    {
      title: 'Experiencia',
      text: 'Mira nuestros tiempos estimados, principios y visión de futuro.',
      link: '/experiencia'
    }
  ];
}