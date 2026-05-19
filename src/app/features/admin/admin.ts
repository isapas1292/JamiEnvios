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
  activeTab: 'dashboard' | 'envios' | 'usuarios' | 'empleado' | 'empleados_list' | 'facturas' | 'crear_envio' = 'dashboard';
  private readonly VALID_TABS = ['dashboard', 'envios', 'usuarios', 'empleado', 'empleados_list', 'facturas', 'crear_envio'] as const;

  // Dashboard stats
  stats = [
    { title: 'Envíos Totales', value: '0', icon: '📦', trend: 'N/A', positive: true },
    { title: 'Usuarios Activos', value: '0', icon: '👥', trend: 'N/A', positive: true },
  ];

  // Data
  usuarios: AdminUsuario[] = [];
  envios: AdminEnvio[] = [];
  empleados: any[] = [];
  facturas: any[] = [];

  // Filters
  enviosFilters = {
    guia: '',
    cliente: '',
    recibe: '',
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

  usuariosFilters = { nombre: '', email: '', documento: '' };
  empleadosFilters = { documento: '' };
  facturasFilters = { cliente: '', numero: '', fechaInicio: '', fechaFin: '' };

  nuevaFactura: any = { 
    Estatus: 'No pagado',
    Detalles: [{ Articulo: '', Cantidad: 1, Precio: 0, Descuento_Porcentaje: 0, Importe_IVA: 0, Cantidad_Total: 0 }] 
  };
  creandoFactura = false;
  
  nuevoEnvio: any = {};
  creandoEnvio = false;

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
    this.loadEmpleados();
  }

  setTab(tab: 'dashboard' | 'envios' | 'usuarios' | 'empleado' | 'empleados_list' | 'facturas' | 'crear_envio') {
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
    this.enviosFilters = { guia: '', cliente: '', recibe: '', estado: 'Activos', destino: '', direccion: '', fechaInicio: '', fechaFin: '' };
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
    this.usuariosFilters = { nombre: '', email: '', documento: '' };
    this.loadUsuarios();
  }

  loadEmpleados() {
    this.adminService.getEmpleados(this.empleadosFilters.documento).subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.empleados = data;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          console.error('Error cargando empleados', err);
          this.cdr.detectChanges();
        });
      }
    });
  }

  resetEmpleadosFilters() {
    this.empleadosFilters = { documento: '' };
    this.loadEmpleados();
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

  // --- Facturas ---
  loadFacturas() {
    this.adminService.getFacturas(this.facturasFilters).subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.facturas = data;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          console.error('Error cargando facturas', err);
          this.cdr.detectChanges();
        });
      }
    });
  }

  resetFacturasFilters() {
    this.facturasFilters = { cliente: '', numero: '', fechaInicio: '', fechaFin: '' };
    this.loadFacturas();
  }

  agregarDetalle() {
    if (!this.nuevaFactura.Detalles) this.nuevaFactura.Detalles = [];
    this.nuevaFactura.Detalles.push({ Articulo: '', Cantidad: 1, Precio: 0, Descuento_Porcentaje: 0, Importe_IVA: 0, Cantidad_Total: 0 });
    this.calcularTotales();
  }

  removerDetalle(index: number) {
    this.nuevaFactura.Detalles.splice(index, 1);
    this.calcularTotales();
  }

  calcularTotales() {
    let subtotal = 0;
    let totalIva = 0;
    for (let det of this.nuevaFactura.Detalles) {
      let precio = Number(det.Precio) || 0;
      let descPerc = Number(det.Descuento_Porcentaje) || 0;
      let cantidad = Number(det.Cantidad) || 1;
      
      let desc = (precio * descPerc) / 100;
      let precioConDesc = precio - desc;
      let importe = precioConDesc * cantidad;
      
      let ivaPerc = Number(det.Iva_Porcentaje) || 0; // if this is not in UI, defaults to 0
      det.Importe_IVA = (importe * ivaPerc) / 100; 
      det.Cantidad_Total = importe + det.Importe_IVA;

      subtotal += importe;
      totalIva += det.Importe_IVA;
    }
    this.nuevaFactura.Cantidad = subtotal;
    this.nuevaFactura.Importe_IVA = totalIva;
    this.nuevaFactura.Cantidad_Total = subtotal + totalIva;
    this.nuevaFactura.Cantidad_Pagar = this.nuevaFactura.Cantidad_Total; 
    this.nuevaFactura.Importe_Pendiente = this.nuevaFactura.Cantidad_Pagar - (Number(this.nuevaFactura.Pagos) || 0);
  }

  crearFactura() {
    this.creandoFactura = true;
    this.adminService.createFactura(this.nuevaFactura).subscribe({
      next: () => {
        this.creandoFactura = false;
        alert('Factura creada exitosamente');
        this.nuevaFactura = { Estatus: 'No pagado', Detalles: [{ Articulo: '', Cantidad: 1, Precio: 0, Descuento_Porcentaje: 0, Importe_IVA: 0, Cantidad_Total: 0 }] };
        this.loadFacturas();
      },
      error: (err) => {
        console.error('Error creando factura:', err);
        this.creandoFactura = false;
        alert('Hubo un error al registrar la factura.');
      }
    });
  }

  // --- Crear Envio ---
  crearEnvioAdmin() {
    if (!this.nuevoEnvio.Numero_Guia || !this.nuevoEnvio.Nombre_Cliente || !this.nuevoEnvio.Destino) {
      alert('Número de guía, Nombre del cliente y Destino son obligatorios.');
      return;
    }
    
    // Asignar Usuario_Id usando el usuario en sesión si aplica
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      try {
        const u = JSON.parse(usuarioStr);
        this.nuevoEnvio.Usuario_Id = u.id || 1;
      } catch (e) {
        this.nuevoEnvio.Usuario_Id = 1;
      }
    }

    this.creandoEnvio = true;
    this.adminService.createEnvio(this.nuevoEnvio).subscribe({
      next: () => {
        this.creandoEnvio = false;
        alert('Envío registrado exitosamente');
        this.nuevoEnvio = {};
        this.loadEnvios(); // Reload list
        this.setTab('envios'); // Redirect to envios list
      },
      error: (err) => {
        console.error('Error creando envío:', err);
        this.creandoEnvio = false;
        alert('Hubo un error al registrar el envío. Verifica la consola.');
      }
    });
  }

  onUsuarioSelectByNombre(formObj: any) {
    if (!formObj.Nombre_Cliente) return;
    const user = this.usuarios.find(u => u.Nombre.toLowerCase() === formObj.Nombre_Cliente.toLowerCase());
    if (user) {
      if (!formObj.DocumentodeIdentidad && user.DocumentodeIdentidad) formObj.DocumentodeIdentidad = user.DocumentodeIdentidad;
      if (formObj.hasOwnProperty('Telefono_Cliente') && !formObj.Telefono_Cliente && user.Phone) formObj.Telefono_Cliente = user.Phone;
    }
  }

  onUsuarioSelectByDoc(formObj: any) {
    if (!formObj.DocumentodeIdentidad) return;
    const user = this.usuarios.find(u => u.DocumentodeIdentidad === formObj.DocumentodeIdentidad);
    if (user) {
      if (!formObj.Nombre_Cliente && user.Nombre) formObj.Nombre_Cliente = user.Nombre;
      if (formObj.hasOwnProperty('Telefono_Cliente') && !formObj.Telefono_Cliente && user.Phone) formObj.Telefono_Cliente = user.Phone;
    }
  }
}
