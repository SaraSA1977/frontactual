// src/app/service/foroService/foroService.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginService } from '../loginService/loginService';

@Injectable({ providedIn: 'root' })
export class ForoService {

  private API = `${environment.apiBaseUrl}/foro`;

  constructor(
    private http: HttpClient,
    private loginService: LoginService
  ) {}

  // FIX: HttpHeaders explícito — evita el error de tipo TS2769
  private getHeaders(): HttpHeaders {
    const token = this.loginService.getToken();
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return token ? headers.set('Authorization', `Bearer ${token}`) : headers;
  }

  private extract(res: any): any[] {
    return Array.isArray(res) ? res : (res?.data ?? []);
  }

  // ── Preguntas ───────────────────────────────────────────────

  getAllPreguntas(): Observable<any[]> {
    return this.http
      .get<any>(`${this.API}/preguntas/getAll`, { headers: this.getHeaders() })
      .pipe(map(res => this.extract(res)));
  }

  createPregunta(data: any): Observable<any> {
    return this.http
      .post<any>(`${this.API}/preguntas/create`, data, { headers: this.getHeaders() })
      .pipe(map((res: any) => res?.data ?? res));
  }

  closePregunta(id: number): Observable<any> {
    return this.http
      .patch<any>(`${this.API}/preguntas/close/${id}`, {}, { headers: this.getHeaders() })
      .pipe(map((res: any) => res?.data ?? res));
  }

  deletePregunta(id: number): Observable<any> {
    return this.http
      .delete<any>(`${this.API}/preguntas/delete/${id}`, { headers: this.getHeaders() });
  }

  // ── Respuestas ──────────────────────────────────────────────

  createRespuesta(data: any): Observable<any> {
    return this.http
      .post<any>(`${this.API}/respuestas/create`, data, { headers: this.getHeaders() })
      .pipe(map((res: any) => res?.data ?? res));
  }

  deleteRespuesta(id: number): Observable<any> {
    return this.http
      .delete<any>(`${this.API}/respuestas/delete/${id}`, { headers: this.getHeaders() });
  }
}