import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol_id?: number;
}

export interface LoginResponse {
  mensaje: string;
  usuario: Usuario;
}

export interface RegisterResponse {
  mensaje: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Recuperar usuario del localStorage si existe (solo en el navegador)
    if (typeof window !== 'undefined' && localStorage) {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        try {
          this.currentUserSubject.next(JSON.parse(savedUser));
        } catch (e) {
          console.error('Error parsing saved user:', e);
        }
      }
    }
  }

  // Registro de nuevo usuario
  register(nombre: string, email: string, password: string, phone?: string): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/usuarios`, {
      nombre,
      email,
      password,
      rol_id: 1,  // Usuario normal por defecto
      telefono: phone
    }).pipe(
      tap(response => {
        console.log('Usuario registrado exitosamente');
      })
    );
  }

  // Login
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        if (response && response.usuario) {
          if (typeof window !== 'undefined' && localStorage) {
            localStorage.setItem('currentUser', JSON.stringify(response.usuario));
          }
          this.currentUserSubject.next(response.usuario);
        }
      })
    );
  }

  // Logout
  logout(): void {
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
  }

  // Obtener usuario actual
  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.getValue();
  }

  // Verificar si está logueado
  isLoggedIn(): boolean {
    return this.currentUserSubject.getValue() !== null;
  }
}
