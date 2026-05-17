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
    // Recuperar usuario del localStorage si existe y si no han pasado 15 días
    if (typeof window !== 'undefined' && localStorage) {
      const savedUser = localStorage.getItem('currentUser');
      const loginTimestamp = localStorage.getItem('loginTimestamp');
      
      if (savedUser && loginTimestamp) {
        const fifteenDaysInMs = 15 * 24 * 60 * 60 * 1000;
        const timePassed = Date.now() - parseInt(loginTimestamp, 10);
        
        if (timePassed > fifteenDaysInMs) {
          // Session expired after 15 days
          localStorage.removeItem('currentUser');
          localStorage.removeItem('loginTimestamp');
        } else {
          try {
            this.currentUserSubject.next(JSON.parse(savedUser));
            this.scheduleLogout(fifteenDaysInMs - timePassed);
          } catch (e) {
            console.error('Error parsing saved user:', e);
          }
        }
      } else if (savedUser) {
        // Fallback for users who logged in before we added timestamp
        try {
          this.currentUserSubject.next(JSON.parse(savedUser));
          localStorage.setItem('loginTimestamp', Date.now().toString());
          this.scheduleLogout(15 * 24 * 60 * 60 * 1000);
        } catch (e) {
          console.error('Error parsing saved user:', e);
        }
      }
    }
  }

  private scheduleLogout(msUntilLogout: number) {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.logout();
        // Option to reload or redirect can be handled by components listening to currentUser$
      }, msUntilLogout);
    }
  }

  // Registro de nuevo usuario
  register(nombre: string, email: string, password: string, phone?: string, cedula?: string): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/usuarios`, {
      nombre,
      email,
      password,
      rol_id: 1,  // Usuario normal por defecto
      telefono: phone,
      cedula: cedula
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
            localStorage.setItem('loginTimestamp', Date.now().toString());
            this.scheduleLogout(15 * 24 * 60 * 60 * 1000);
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
      localStorage.removeItem('loginTimestamp');
      localStorage.removeItem('usuario');
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
