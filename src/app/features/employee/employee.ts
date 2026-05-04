import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminEnvio } from '../../shared/services/admin.service';
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

  nuevoUsuario = {
    nombre: '',
    email: '',
    password: '',
    phone: ''
  };
  creandoUsuario = false;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.loadEnvios();
  }

  loadEnvios() {
    this.loading = true;
    this.adminService.getEnvios().subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.enviosActivos = data.filter(e => e.Estado_Envio_Id !== 5 && e.Estado_Envio_Id !== 6);
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
      next: (res) => {
        envio.Estado_Envio_Id = estadoIdNum;
        envio.Estado_Nombre = this.estadosValidos.find(e => e.id === estadoIdNum)?.nombre || '';
        
        // Si el nuevo estado es Entregado o Cancelado, removerlo de la lista de activos después de un momento
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
      this.nuevoUsuario.phone
    ).subscribe({
      next: () => {
        this.creandoUsuario = false;
        alert('Usuario creado correctamente');
        this.nuevoUsuario = { nombre: '', email: '', password: '', phone: '' };
      },
      error: (err) => {
        console.error('Error creando usuario:', err);
        this.creandoUsuario = false;
        alert('Hubo un error al crear el usuario. Revisa la consola para más detalles.');
      }
    });
  }
}
