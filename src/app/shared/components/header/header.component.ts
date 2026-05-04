import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, Usuario } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  mobileMenuOpen = false;
  isLoggedIn = false;
  isAdmin = false;
  isEmployee = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user: Usuario | null) => {
      this.isLoggedIn = !!user;
      this.isAdmin = user?.rol_id === 2;
      this.isEmployee = user?.rol_id === 4;
    });
  }

  toggleMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMenu(): void {
    this.mobileMenuOpen = false;
  }
}