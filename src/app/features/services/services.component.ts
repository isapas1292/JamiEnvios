import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent {
  services = [
    {
      icon: '📦',
      title: 'Envío de cajas y paquetes',
      text: 'Transporte organizado y seguro para mercancías personales y comerciales.'
    },
    {
      icon: '📋',
      title: 'Documentación Aduanera',
      text: 'Gestión completa de trámites y documentos para tus envíos internacionales.'
    },
    {
      icon: '🏠',
      title: 'Mudanzas internacionales',
      text: 'Opciones logísticas para mover pertenencias desde España hacia República Dominicana.'
    },
    {
      icon: '🚚',
      title: 'Servicio puerta a puerta',
      text: 'Recogida y entrega para facilitar el proceso completo al cliente.'
    },
    {
      icon: '🏪',
      title: 'Carga comercial',
      text: 'Soluciones para pequeños negocios y operaciones comerciales con destino a RD.'
    },
    {
      icon: '🛢️',
      title: 'Tanques y otros envíos especiales',
      text: 'Gestión de distintos formatos de mercancía dentro de la misma operación logística.'
    },
     {
      icon: '🧠',
      title: 'Asesoría Logística',
      text: 'Te ayudamos a planificar y optimizar tus procesos de envío.'
    },
    {
      icon: '📊',
      title: 'Carga Consolidada',
      text: 'Optimiza tus envíos agrupando mercancía para reducir costos.'
    }
  ];

  steps = [
    'Recibimos o coordinamos la recogida de la mercancía.',
    'Organizamos el proceso de salida y consolidación logística.',
    'Transportamos la carga por vía marítima.',
    'Te acompañamos hasta la entrega en destino.'
  ];
}