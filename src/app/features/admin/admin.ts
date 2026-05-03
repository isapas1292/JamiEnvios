import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminUsuario, AdminEnvio } from '../../shared/services/admin.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  activeTab: 'dashboard' | 'envios' | 'usuarios' = 'dashboard';
  
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
    estado: '',
    destino: '',
    fechaInicio: '',
    fechaFin: ''
  };

  usuariosFilters = {
    nombre: '',
    email: ''
  };

  loading = false;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadEnvios();
    this.loadUsuarios();
  }

  setTab(tab: 'dashboard' | 'envios' | 'usuarios') {
    this.activeTab = tab;
  }

  loadEnvios() {
    this.loading = true;
    this.adminService.getEnvios(this.enviosFilters).subscribe({
      next: (data) => {
        this.envios = data;
        this.stats[0].value = data.length.toString();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando envíos', err);
        this.loading = false;
      }
    });
  }

  loadUsuarios() {
    this.loading = true;
    this.adminService.getUsuarios(this.usuariosFilters).subscribe({
      next: (data) => {
        this.usuarios = data;
        this.stats[1].value = data.length.toString();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando usuarios', err);
        this.loading = false;
      }
    });
  }

  resetEnviosFilters() {
    this.enviosFilters = { cliente: '', estado: '', destino: '', fechaInicio: '', fechaFin: '' };
    this.loadEnvios();
  }

  resetUsuariosFilters() {
    this.usuariosFilters = { nombre: '', email: '' };
    this.loadUsuarios();
  }
}
