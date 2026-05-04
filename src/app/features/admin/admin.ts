import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminUsuario, AdminEnvio } from '../../shared/services/admin.service';
import { Employee } from '../employee/employee';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, Employee],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  activeTab: 'dashboard' | 'envios' | 'usuarios' | 'empleado' = 'dashboard';

  // Dashboard stats
  stats = [
    { title: 'Envíos Totales', value: '0', icon: '📦', trend: 'N/A', positive: true },
    { title: 'Usuarios Activos', value: '0', icon: '👥', trend: 'N/A', positive: true },
  ];

  // Data
  usuarios: AdminUsuario[] = [];
  envios: AdminEnvio[] = [];

  // Filters
  enviosFilters = {
    cliente: '',
    estado: 'Activos',
    destino: '',
    direccion: '',
    fechaInicio: '',
    fechaFin: ''
  };

  provinciasRD = [
    'Azua', 'Bahoruco', 'Barahona', 'Dajabón', 'Distrito Nacional',
    'Duarte', 'El Seibo', 'Elías Piña', 'Espaillat', 'Hato Mayor',
    'Hermanas Mirabal', 'Independencia', 'La Altagracia', 'La Romana',
    'La Vega', 'María Trinidad Sánchez', 'Monseñor Nouel', 'Monte Cristi',
    'Monte Plata', 'Pedernales', 'Peravia', 'Puerto Plata',
    'Samaná', 'San Cristóbal', 'San José de Ocoa', 'San Juan',
    'San Pedro de Macorís', 'Sánchez Ramírez', 'Santiago',
    'Santiago Rodríguez', 'Santo Domingo', 'Valverde'
  ];

  // Editing state
  editingEnvioId: number | null = null;
  editedEnvio: Partial<AdminEnvio> = {};

  usuariosFilters = {
    nombre: '',
    email: ''
  };

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef, private ngZone: NgZone) { }

  ngOnInit() {
    this.loadEnvios();
    this.loadUsuarios();
  }

  setTab(tab: 'dashboard' | 'envios' | 'usuarios' | 'empleado') {
    this.activeTab = tab;
  }

  loadEnvios() {
    this.adminService.getEnvios(this.enviosFilters).subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.envios = data;
          this.stats[0].value = data.length.toString();
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          console.error('Error cargando envíos', err);
          this.cdr.detectChanges();
        });
      }
    });
  }

  loadUsuarios() {
    this.adminService.getUsuarios(this.usuariosFilters).subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.usuarios = data;
          this.stats[1].value = data.length.toString();
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          console.error('Error cargando usuarios', err);
          this.cdr.detectChanges();
        });
      }
    });
  }

  resetEnviosFilters() {
    this.enviosFilters = { cliente: '', estado: 'Activos', destino: '', direccion: '', fechaInicio: '', fechaFin: '' };
    this.loadEnvios();
  }

  startEditing(envio: AdminEnvio) {
    this.editingEnvioId = envio.Id;
    this.editedEnvio = { ...envio };
  }

  cancelEditing() {
    this.editingEnvioId = null;
    this.editedEnvio = {};
  }

  saveEditing() {
    if (this.editingEnvioId && this.editedEnvio) {
      this.adminService.updateEnvio(this.editingEnvioId, this.editedEnvio).subscribe({
        next: () => {
          this.loadEnvios();
          this.cancelEditing();
          alert('Envío actualizado correctamente');
        },
        error: (err) => {
          console.error('Error al actualizar envío', err);
          alert('Hubo un error al actualizar el envío');
        }
      });
    }
  }

  resetUsuariosFilters() {
    this.usuariosFilters = { nombre: '', email: '' };
    this.loadUsuarios();
  }
}
