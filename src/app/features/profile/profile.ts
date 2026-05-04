import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, Usuario } from '../../shared/services/auth.service';
import { AdminService, AdminEnvio } from '../../shared/services/admin.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  user: Usuario | null = null;
  envios: AdminEnvio[] = [];
  loading = false;

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.loadHistorial();
    }
  }

  loadHistorial() {
    this.loading = true;
    this.adminService.getEnvios({ usuarioId: this.user?.id }).subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.envios = data;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          console.error('Error al cargar el historial', err);
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
