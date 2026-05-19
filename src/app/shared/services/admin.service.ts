import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminUsuario {
  Id: number;
  Nombre: string;
  Email: string;
  Phone: string;
  Rol_Id: number;
  DocumentodeIdentidad?: string;
}

export interface EmpleadoData {
  Id: number;
  Usuario_Id?: number;
  DocumentodeIdentidad: string;
  Nombre: string;
  Email: string;
  Telefono?: string;
  Cargo?: string;
  FechaIngreso: string;
  Activo: boolean;
}

export interface AdminEnvio {
  Id: number;
  Numero_Guia: string;
  Nombre_Cliente: string;
  DocumentodeIdentidad?: string;
  Telefono_Cliente?: string;
  Fecha_Recepcion: string;
  Estado_Actual?: string;
  Estado_Nombre?: string; // Returned from JOIN
  Estado_Envio_Id: number;
  Destino: string;
  Observaciones: string;
  Nombre_Recibe?: string;
  Cedula_Recibe?: string;
  Telefono_Recibe?: string;
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
      if (filters.documento) params = params.set('documento', filters.documento);
      if (filters.limit) params = params.set('limit', filters.limit);
    }
    return this.http.get<AdminUsuario[]>(`${this.apiUrl}/usuarios`, { params });
  }

  getEnvios(filters?: any): Observable<AdminEnvio[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.guia) params = params.set('guia', filters.guia);
      if (filters.cliente) params = params.set('cliente', filters.cliente);
      if (filters.recibe) params = params.set('recibe', filters.recibe);
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

  getEmpleados(documento?: string): Observable<EmpleadoData[]> {
    let params = new HttpParams();
    if (documento) params = params.set('documento', documento);
    return this.http.get<EmpleadoData[]>(`http://localhost:3000/api/empleados`, { params });
  }

  createEnvio(envioData: any): Observable<any> {
    return this.http.post(`http://localhost:3000/api/envios`, envioData);
  }

  createFactura(facturaData: any): Observable<any> {
    return this.http.post(`http://localhost:3000/api/facturas`, facturaData);
  }

  getFacturas(filters?: any): Observable<any[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.cliente) params = params.set('cliente', filters.cliente);
      if (filters.numero) params = params.set('numero', filters.numero);
      if (filters.fechaInicio) params = params.set('fechaInicio', filters.fechaInicio);
      if (filters.fechaFin) params = params.set('fechaFin', filters.fechaFin);
    }
    return this.http.get<any[]>(`http://localhost:3000/api/facturas`, { params });
  }
}
