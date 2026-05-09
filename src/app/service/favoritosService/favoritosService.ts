// src/app/service/favoritosService/favoritosService.ts

import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginService } from '../loginService/loginService';

@Injectable({ providedIn: 'root' })
export class FavoritosService {

  private API = `${environment.apiBaseUrl}/favoritos`;

  // Signal con los IDs de productos favoritos del usuario actual
  favoritosIds = signal<Set<number>>(new Set());

  constructor(
    private http: HttpClient,
    private loginService: LoginService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.loginService.getToken();
    const h = new HttpHeaders({ 'Content-Type': 'application/json' });
    return token ? h.set('Authorization', `Bearer ${token}`) : h;
  }

  // Cargar favoritos del usuario y llenar el signal
  loadMyFavorites(): Observable<any[]> {
    return this.http
      .get<any>(`${this.API}/getMine`, { headers: this.getHeaders() })
      .pipe(
        tap((res: any) => {
          const data: any[] = Array.isArray(res) ? res : (res?.data ?? []);
          this.favoritosIds.set(new Set(data.map((f: any) => f.product_id)));
        })
      );
  }

  // Verificar si un producto es favorito
  isFavorite(productId: number): boolean {
    return this.favoritosIds().has(productId);
  }

  // Agregar favorito
  addFavorite(productId: number): Observable<any> {
    return this.http
      .post<any>(`${this.API}/add`, { product_id: productId }, { headers: this.getHeaders() })
      .pipe(tap(() => {
        const current = new Set(this.favoritosIds());
        current.add(productId);
        this.favoritosIds.set(current);
      }));
  }

  // Quitar favorito
  removeFavorite(productId: number): Observable<any> {
    return this.http
      .delete<any>(`${this.API}/remove/${productId}`, { headers: this.getHeaders() })
      .pipe(tap(() => {
        const current = new Set(this.favoritosIds());
        current.delete(productId);
        this.favoritosIds.set(current);
      }));
  }

  // Toggle favorito
  toggleFavorite(productId: number): Observable<any> {
    return this.isFavorite(productId)
      ? this.removeFavorite(productId)
      : this.addFavorite(productId);
  }

  // Top 10 para el dashboard
  getTop10(): Observable<any[]> {
    return this.http
      .get<any>(`${this.API}/top10`, { headers: this.getHeaders() })
      .pipe(
        tap(res => res),
      );
  }
}