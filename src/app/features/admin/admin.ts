import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  private readonly VALID_TABS = ['dashboard', 'envios', 'usuarios', 'empleado'] as const;

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

  // Bulk selection
  selectedEnvioIds = new Set<number>();
  bulkEstado: string = '';
  bulkLoading = false;

  estadosValidos = [
    { id: 1, nombre: 'Pendiente' },
    { id: 2, nombre: 'En Tránsito' },
    { id: 3, nombre: 'En Aduana' },
    { id: 4, nombre: 'En Reparto' },
    { id: 5, nombre: 'Entregado' },
    { id: 6, nombre: 'Cancelado' }
  ];

  usuariosFilters = { nombre: '', email: '' };

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    // Restore active tab from URL on refresh
    this.route.queryParamMap.subscribe(params => {
      const tab = params.get('tab') as typeof this.VALID_TABS[number];
      if (tab && (this.VALID_TABS as readonly string[]).includes(tab)) {
        this.activeTab = tab;
      }
    });
    this.loadEnvios();
    this.loadUsuarios();
  }

  setTab(tab: 'dashboard' | 'envios' | 'usuarios' | 'empleado') {
    this.activeTab = tab;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
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

  // ── Bulk selection ────────────────────────────────────────────────────────

  toggleEnvioSelection(id: number) {
    this.selectedEnvioIds.has(id) ? this.selectedEnvioIds.delete(id) : this.selectedEnvioIds.add(id);
  }

  isEnvioSelected(id: number): boolean {
    return this.selectedEnvioIds.has(id);
  }

  get allEnviosSelected(): boolean {
    return this.envios.length > 0 && this.selectedEnvioIds.size === this.envios.length;
  }

  get isBulkPartialAdmin(): boolean {
    return this.selectedEnvioIds.size > 0 && this.selectedEnvioIds.size < this.envios.length;
  }

  toggleAllEnvios(checked: boolean) {
    checked ? this.envios.forEach(e => this.selectedEnvioIds.add(e.Id)) : this.selectedEnvioIds.clear();
  }

  cambiarEstadoMasivoAdmin() {
    const estadoIdNum = parseInt(this.bulkEstado, 10);
    if (!estadoIdNum) { alert('Selecciona un estado destino'); return; }
    if (this.selectedEnvioIds.size === 0) { alert('Selecciona al menos un pedido'); return; }

    this.bulkLoading = true;
    const ids = Array.from(this.selectedEnvioIds);
    let done = 0, errs = 0;

    ids.forEach(id => {
      this.adminService.updateEstadoEnvio(id, estadoIdNum).subscribe({
        next: () => {
          const envio = this.envios.find(e => e.Id === id);
          if (envio) {
            envio.Estado_Envio_Id = estadoIdNum;
            envio.Estado_Nombre = this.estadosValidos.find(e => e.id === estadoIdNum)?.nombre || '';
          }
          if (++done + errs === ids.length) this.finalizeBulkAdmin(done, errs);
        },
        error: () => { if (done + ++errs === ids.length) this.finalizeBulkAdmin(done, errs); }
      });
    });
  }

  private finalizeBulkAdmin(done: number, errs: number) {
    this.bulkLoading = false;
    this.selectedEnvioIds.clear();
    this.bulkEstado = '';
    this.cdr.detectChanges();
    alert(errs > 0
      ? `${done} actualizados correctamente. ${errs} con error.`
      : `${done} pedidos actualizados correctamente.`);
  }
}
