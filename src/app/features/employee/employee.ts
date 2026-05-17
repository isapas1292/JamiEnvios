import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminEnvio, AdminUsuario } from '../../shared/services/admin.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee.html',
  styleUrl: './employee.css'
})
export class Employee implements OnInit {
  enviosActivos: AdminEnvio[] = [];
  loading = false;

  estadosValidos = [
    { id: 1, nombre: 'Pendiente' },
    { id: 2, nombre: 'En Tránsito' },
    { id: 3, nombre: 'En Aduana' },
    { id: 4, nombre: 'En Reparto' },
    { id: 5, nombre: 'Entregado' },
    { id: 6, nombre: 'Cancelado' }
  ];

  // Bulk selection
  selectedIds = new Set<number>();
  bulkEstado: string = '';
  bulkLoading = false;

  nuevoUsuario = { nombre: '', email: '', password: '', phone: '', cedula: '' };
  creandoUsuario = false;

  nuevoEnvio: any = {};
  creandoEnvio = false;

  // Clientes state
  clientes: AdminUsuario[] = [];
  clientesLoading = false;
  filtroCliente: string = '';

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    this.loadEnvios();
    this.loadClientes();
  }

  loadClientes() {
    this.clientesLoading = true;
    this.adminService.getUsuarios({ nombre: this.filtroCliente }).subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.clientes = data.filter(u => u.Rol_Id === 1);
          this.clientesLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          console.error('Error cargando clientes', err);
          this.clientesLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  loadEnvios() {
    this.loading = true;
    this.adminService.getEnvios().subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.enviosActivos = data.filter(e => e.Estado_Envio_Id !== 5 && e.Estado_Envio_Id !== 6);
          this.selectedIds.clear(); // Clear selection on reload
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          console.error('Error cargando envíos', err);
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  cambiarEstado(envio: AdminEnvio, nuevoEstadoId: string) {
    const estadoIdNum = parseInt(nuevoEstadoId, 10);
    if (!estadoIdNum || estadoIdNum === envio.Estado_Envio_Id) return;

    this.adminService.updateEstadoEnvio(envio.Id, estadoIdNum).subscribe({
      next: () => {
        envio.Estado_Envio_Id = estadoIdNum;
        envio.Estado_Nombre = this.estadosValidos.find(e => e.id === estadoIdNum)?.nombre || '';
        if (estadoIdNum === 5 || estadoIdNum === 6) {
          setTimeout(() => {
            this.enviosActivos = this.enviosActivos.filter(e => e.Id !== envio.Id);
            this.cdr.detectChanges();
          }, 1500);
        }
        this.cdr.detectChanges();
        alert('Estado actualizado correctamente');
      },
      error: (err) => {
        console.error('Error actualizando estado', err);
        alert('Hubo un error al actualizar el estado');
      }
    });
  }

  // ── Bulk selection ────────────────────────────────────────────────────────

  toggleSelection(id: number) {
    this.selectedIds.has(id) ? this.selectedIds.delete(id) : this.selectedIds.add(id);
  }

  isSelected(id: number): boolean {
    return this.selectedIds.has(id);
  }

  get allSelected(): boolean {
    return this.enviosActivos.length > 0 && this.selectedIds.size === this.enviosActivos.length;
  }

  get isBulkPartial(): boolean {
    return this.selectedIds.size > 0 && this.selectedIds.size < this.enviosActivos.length;
  }

  toggleAll(checked: boolean) {
    checked ? this.enviosActivos.forEach(e => this.selectedIds.add(e.Id)) : this.selectedIds.clear();
  }

  cambiarEstadoMasivo() {
    const estadoIdNum = parseInt(this.bulkEstado, 10);
    if (!estadoIdNum) { alert('Selecciona un estado destino'); return; }
    if (this.selectedIds.size === 0) { alert('Selecciona al menos un pedido'); return; }

    this.bulkLoading = true;
    const ids = Array.from(this.selectedIds);
    let done = 0, errs = 0;

    ids.forEach(id => {
      this.adminService.updateEstadoEnvio(id, estadoIdNum).subscribe({
        next: () => {
          const envio = this.enviosActivos.find(e => e.Id === id);
          if (envio) {
            envio.Estado_Envio_Id = estadoIdNum;
            envio.Estado_Nombre = this.estadosValidos.find(e => e.id === estadoIdNum)?.nombre || '';
          }
          if (++done + errs === ids.length) this.finalizeBulk(done, errs, estadoIdNum);
        },
        error: () => { if (done + ++errs === ids.length) this.finalizeBulk(done, errs, estadoIdNum); }
      });
    });
  }

  private finalizeBulk(done: number, errs: number, estadoIdNum: number) {
    this.bulkLoading = false;
    if (estadoIdNum === 5 || estadoIdNum === 6) {
      // Remove those that were successfully updated to a final state
      this.enviosActivos = this.enviosActivos.filter(e => {
        const isSelected = this.selectedIds.has(e.Id);
        return !(isSelected && e.Estado_Envio_Id === estadoIdNum);
      });
    }
    this.selectedIds.clear();
    this.bulkEstado = '';
    this.cdr.detectChanges();
    alert(errs > 0
      ? `${done} actualizados correctamente. ${errs} con error.`
      : `${done} pedidos actualizados correctamente.`);
  }

  crearUsuario() {
    if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.email || !this.nuevoUsuario.password) {
      alert('Nombre, email y contraseña son obligatorios');
      return;
    }
    this.creandoUsuario = true;
    this.authService.register(
      this.nuevoUsuario.nombre,
      this.nuevoUsuario.email,
      this.nuevoUsuario.password,
      this.nuevoUsuario.phone,
      this.nuevoUsuario.cedula
    ).subscribe({
      next: () => {
        this.creandoUsuario = false;
        alert('Usuario creado correctamente');
        this.nuevoUsuario = { nombre: '', email: '', password: '', phone: '', cedula: '' };
        this.loadClientes(); // Reload list
      },
      error: (err) => {
        console.error('Error creando usuario:', err);
        this.creandoUsuario = false;
        alert('Hubo un error al crear el usuario. Revisa la consola para más detalles.');
      }
    });
  }

  crearEnvio() {
    if (!this.nuevoEnvio.Numero_Guia || !this.nuevoEnvio.Nombre_Cliente || !this.nuevoEnvio.Destino) {
      alert('Número de guía, Nombre del cliente y Destino son obligatorios.');
      return;
    }
    
    // Asignar Usuario_Id usando el usuario en sesión si aplica, o uno por defecto
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
      },
      error: (err) => {
        console.error('Error creando envío:', err);
        this.creandoEnvio = false;
        alert('Hubo un error al registrar el envío. Verifica la consola.');
      }
    });
  }

  onClienteSelectByNombre(formObj: any) {
    if (!formObj.Nombre_Cliente) return;
    const user = this.clientes.find(u => u.Nombre.toLowerCase() === formObj.Nombre_Cliente.toLowerCase());
    if (user) {
      if (!formObj.DocumentodeIdentidad && user.DocumentodeIdentidad) formObj.DocumentodeIdentidad = user.DocumentodeIdentidad;
      if (formObj.hasOwnProperty('Telefono_Cliente') && !formObj.Telefono_Cliente && user.Phone) formObj.Telefono_Cliente = user.Phone;
    }
  }

  onClienteSelectByDoc(formObj: any) {
    if (!formObj.DocumentodeIdentidad) return;
    const user = this.clientes.find(u => u.DocumentodeIdentidad === formObj.DocumentodeIdentidad);
    if (user) {
      if (!formObj.Nombre_Cliente && user.Nombre) formObj.Nombre_Cliente = user.Nombre;
      if (formObj.hasOwnProperty('Telefono_Cliente') && !formObj.Telefono_Cliente && user.Phone) formObj.Telefono_Cliente = user.Phone;
    }
  }
}
