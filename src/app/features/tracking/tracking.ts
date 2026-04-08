import { Component } from '@angular/core';
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
  searchQuery: string = '';
  isSearching: boolean = false;
  hasResult: boolean = false;

  timelineSteps = [
    { text: 'Recibido en Barcelona', icon: '📦', active: true },
    { text: 'En almacén', icon: '🏭', active: true },
    { text: 'En tránsito', icon: '🚢', active: true },
    { text: 'Llegó a Santo Domingo', icon: '🛬', active: false },
    { text: 'Listo para entrega o retiro', icon: '✅', active: false }
  ];

  onSearch() {
    if (!this.searchQuery.trim()) return;
    
    this.isSearching = true;
    this.hasResult = false;

    // Simular tiempo de carga de 1.5 segundos
    setTimeout(() => {
      this.isSearching = false;
      this.hasResult = true;
    }, 1500);
  }
}
