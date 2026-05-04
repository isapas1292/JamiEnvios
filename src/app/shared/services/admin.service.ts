import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminUsuario {
  Id: number;
  Nombre: string;
  Email: string;
  Phone: string;
  Rol_Id: number;
}

export interface AdminEnvio {
  Id: number;
  Numero_Guia: string;
  Nombre_Cliente: string;
  Fecha_Recepcion: string;
  Estado_Actual?: string;
  Estado_Nombre?: string; // Returned from JOIN
  Estado_Envio_Id: number;
  Destino: string;
  Observaciones: string;
  Usuario_Id: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:3000/api/admin';

  constructor(private http: HttpClient) {}

  getUsuarios(filters?: any): Observable<AdminUsuario[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.nombre) params = params.set('nombre', filters.nombre);
      if (filters.email) params = params.set('email', filters.email);
      if (filters.limit) params = params.set('limit', filters.limit);
    }
    return this.http.get<AdminUsuario[]>(`${this.apiUrl}/usuarios`, { params });
  }

  getEnvios(filters?: any): Observable<AdminEnvio[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.cliente) params = params.set('cliente', filters.cliente);
      if (filters.estado) params = params.set('estado', filters.estado);
      if (filters.destino) params = params.set('destino', filters.destino);
      if (filters.direccion) params = params.set('direccion', filters.direccion);
      if (filters.fechaInicio) params = params.set('fechaInicio', filters.fechaInicio);
      if (filters.fechaFin) params = params.set('fechaFin', filters.fechaFin);
      if (filters.usuarioId) params = params.set('usuarioId', filters.usuarioId);
      if (filters.limit) params = params.set('limit', filters.limit);
    }
    return this.http.get<AdminEnvio[]>(`${this.apiUrl}/envios`, { params });
  }

  updateEstadoEnvio(id: number, estado_id: number): Observable<any> {
    return this.http.put(`http://localhost:3000/api/envios/${id}/estado`, { estado_id });
  }

  updateEnvio(id: number, envio: Partial<AdminEnvio>): Observable<any> {
    return this.http.put(`${this.apiUrl}/envios/${id}`, envio);
  }
}
