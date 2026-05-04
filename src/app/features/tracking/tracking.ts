import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tracking.html',
  styleUrls: ['./tracking.css']
})
export class Tracking {
  searchQuery = '';
  isSearching = false;
  hasResult = false;
  errorMsg = '';
  envioData: any = null;
  progressWidth = '0%';

  timelineSteps = [
    { id: 1, text: 'Recibido', icon: '📦', active: false },
    { id: 2, text: 'En tránsito', icon: '🚢', active: false },
    { id: 3, text: 'En Aduana', icon: '🏢', active: false },
    { id: 4, text: 'En Reparto', icon: '🚚', active: false },
    { id: 5, text: 'Entregado', icon: '✅', active: false }
  ];

  constructor(private cdr: ChangeDetectorRef, private zone: NgZone) {}

  onSearch() {
    const query = this.searchQuery.trim();
    if (!query) return;

    this.isSearching = true;
    this.hasResult = false;
    this.errorMsg = '';
    this.envioData = null;
    this.cdr.detectChanges();

    fetch('http://localhost:3000/api/envios/tracking/' + encodeURIComponent(query))
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        this.zone.run(() => {
          this.envioData = data;

          const fecha = new Date(data.Fecha_Recepcion);
          const estimada = new Date(fecha);
          estimada.setDate(fecha.getDate() + 7);
          this.envioData.Fecha_Estimada = estimada;

          this.timelineSteps = [
            { id: 1, text: 'Recibido', icon: '📦', active: 1 <= data.Estado_Envio_Id },
            { id: 2, text: 'En tránsito', icon: '🚢', active: 2 <= data.Estado_Envio_Id },
            { id: 3, text: 'En Aduana', icon: '🏢', active: 3 <= data.Estado_Envio_Id },
            { id: 4, text: 'En Reparto', icon: '🚚', active: 4 <= data.Estado_Envio_Id },
            { id: 5, text: 'Entregado', icon: '✅', active: 5 <= data.Estado_Envio_Id }
          ];

          let progress = 0;
          if (data.Estado_Envio_Id > 0 && data.Estado_Envio_Id <= 5) {
            progress = ((data.Estado_Envio_Id - 1) / 4) * 100;
          }
          this.progressWidth = progress + '%';

          this.isSearching = false;
          this.hasResult = true;
          this.cdr.detectChanges();
        });
      })
      .catch(() => {
        this.zone.run(() => {
          this.isSearching = false;
          this.errorMsg = 'No se encontró ningún envío con ese número de guía.';
          this.cdr.detectChanges();
        });
      });
  }
}
