// src/app/service/productService/productService.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Product {
  id: number;
  comercial_name: string;
  concentracion: string | null;
  notas: string | null;
  active: boolean;
  id_grupo: number;
  grupo: string;
  id_ff: number;
  forma_farmaceutica: string;
  id_lab: number | null;
  laboratorio: string | null;
  id_action_mecanic: number | null;
  action_mecanic: string | null;
  id_nombre_generico: number | null;
  nombre_generico: string | null;
  id_posology: number | null;
  posology: string | null;
  id_family: number | null;
  family: string | null;
}

export interface DashboardStats {
  totalProductos:           number;
  totalLaboratorios:        number;
  topCategoria:             string;
  topForma:                 string;
  productosPorCategoria:    { label: string; count: number }[];
  productosPorForma:        { label: string; count: number }[];
  productosPorLab:          { label: string; count: number }[];
  productosPorFamilia:      { label: string; count: number }[];
  productosPorMecanismo:    { label: string; count: number }[];
  productosPorPosologia:    { label: string; count: number }[];
  productosPorConcentracion:{ label: string; count: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = `${environment.apiBaseUrl}/products`;
  private readonly TOKEN_KEY = 'my_token_key';

  constructor(private http: HttpClient) {}

  // ── Headers con JWT ───────────────────────────────────────
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return new HttpHeaders(
      token ? { Authorization: `Bearer ${token}` } : {}
    );
  }

  // ── Obtener todos los productos ───────────────────────────
  getAllProducts(): Observable<Product[]> {
    return this.http.get<any>(`${this.apiUrl}/getAll`, {
      headers: this.getHeaders()
    }).pipe(
      map(res => {
        if (Array.isArray(res))       return res;
        if (Array.isArray(res?.data)) return res.data;
        return [];
      })
    );
  }

  // ── Agrupar productos por campo ───────────────────────────
  private groupBy(products: Product[], key: keyof Product): { label: string; count: number }[] {
    const map = new Map<string, number>();
    for (const p of products) {
      const val = p[key];
      if (val) {
        const k = String(val);
        map.set(k, (map.get(k) ?? 0) + 1);
      }
    }
    return Array.from(map.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }

  // ── Calcular estadísticas para el dashboard ───────────────
  getDashboardStats(): Observable<DashboardStats> {
    return this.getAllProducts().pipe(
      map(products => {

        const productosPorCategoria    = this.groupBy(products, 'grupo');
        const productosPorForma        = this.groupBy(products, 'forma_farmaceutica');
        const productosPorLab          = this.groupBy(products, 'laboratorio');
        const productosPorFamilia      = this.groupBy(products, 'family');
        const productosPorMecanismo    = this.groupBy(products, 'action_mecanic');
        const productosPorPosologia    = this.groupBy(products, 'posology');
        const productosPorConcentracion = this.groupBy(products, 'concentracion');

        return {
          totalProductos:            products.length,
          totalLaboratorios:         productosPorLab.length,
          topCategoria:              productosPorCategoria[0]?.label ?? '--',
          topForma:                  productosPorForma[0]?.label     ?? '--',
          productosPorCategoria,
          productosPorForma,
          productosPorLab,
          productosPorFamilia,
          productosPorMecanismo,
          productosPorPosologia,
          productosPorConcentracion,
        };
      })
    );
  }

  // ── Crear producto ────────────────────────────────────────
  createProduct(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/createProduct`, data, {
      headers: this.getHeaders()
    });
  }

  // ── Actualizar producto ───────────────────────────────────
  updateProduct(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/updateProduct/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  // ── Eliminar producto ─────────────────────────────────────
  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteProduct/${id}`, {
      headers: this.getHeaders()
    });
  }
}