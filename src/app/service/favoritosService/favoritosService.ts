// src/app/service/favoritosService/favoritosService.ts

import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginService } from '../loginService/loginService';

@Injectable({ providedIn: 'root' })
export class FavoritosService {

  private API = `${environment.apiBaseUrl}/favoritos`;

  // Signal con los IDs de productos favoritos del usuario actual
  // Set para búsqueda O(1)
  favoritosIds = signal<Set<number>>(new Set());

  // Flag para saber si ya cargamos los favoritos
  private cargado = false;

  constructor(
    private http: HttpClient,
    private loginService: LoginService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.loginService.getToken();
    const h = new HttpHeaders({ 'Content-Type': 'application/json' });
    return token ? h.set('Authorization', `Bearer ${token}`) : h;
  }

  // ── Cargar favoritos del usuario al iniciar ───────────────
  // Llama esto en ngOnInit de Products
  loadMyFavorites(): Observable<any[]> {
    return this.http
      .get<any>(`${this.API}/getMine`, { headers: this.getHeaders() })
      .pipe(
        map(res => Array.isArray(res) ? res : (res?.data ?? [])),
        tap((data: any[]) => {
          // Construir el Set con los IDs de productos favoritos
          const ids = new Set<number>(data.map((f: any) => Number(f.product_id)));
          this.favoritosIds.set(ids);
          this.cargado = true;
          console.log('[FAVORITOS] Cargados:', ids.size, 'favoritos');
        }),
        catchError(err => {
          console.error('[FAVORITOS] Error cargando:', err);
          return of([]);
        })
      );
  }

  // ── Verificar si un producto es favorito ──────────────────
  isFavorite(productId: number): boolean {
    return this.favoritosIds().has(Number(productId));
  }

  // ── Agregar favorito ──────────────────────────────────────
  addFavorite(productId: number): Observable<any> {
    return this.http
      .post<any>(
        `${this.API}/add`,
        { product_id: productId },
        { headers: this.getHeaders() }
      ).pipe(
        tap(() => {
          // Actualizar el signal inmediatamente (optimistic update)
          const current = new Set(this.favoritosIds());
          current.add(Number(productId));
          this.favoritosIds.set(current);
          console.log('[FAVORITOS] Agregado:', productId);
        }),
        catchError(err => {
          console.error('[FAVORITOS] Error agregando:', err);
          throw err;
        })
      );
  }

  // ── Quitar favorito ───────────────────────────────────────
  removeFavorite(productId: number): Observable<any> {
    return this.http
      .delete<any>(
        `${this.API}/remove/${productId}`,
        { headers: this.getHeaders() }
      ).pipe(
        tap(() => {
          // Actualizar el signal inmediatamente
          const current = new Set(this.favoritosIds());
          current.delete(Number(productId));
          this.favoritosIds.set(current);
          console.log('[FAVORITOS] Eliminado:', productId);
        }),
        catchError(err => {
          console.error('[FAVORITOS] Error eliminando:', err);
          throw err;
        })
      );
  }

  // ── Toggle — decide si agregar o quitar ───────────────────
  toggleFavorite(productId: number): Observable<any> {
    const id = Number(productId);
    return this.isFavorite(id)
      ? this.removeFavorite(id)
      : this.addFavorite(id);
  }

  // ── Resetear al hacer logout ──────────────────────────────
  reset() {
    this.favoritosIds.set(new Set());
    this.cargado = false;
  }

  // ── Top 10 para el dashboard ──────────────────────────────
  getTop10(): Observable<any[]> {
    return this.http
      .get<any>(`${this.API}/top10`, { headers: this.getHeaders() })
      .pipe(
        map(res => Array.isArray(res) ? res : (res?.data ?? [])),
        catchError(err => {
          console.error('[FAVORITOS] Error top10:', err);
          return of([]);
        })
      );
  }
}