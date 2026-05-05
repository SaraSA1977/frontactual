import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  identification: string;
  email: string;
  full_name: string;
  is_active: number;
}

export interface CreateUserPayload {
  identification: string;
  email: string;
  full_name: string;
  password: string;
  is_active: number;
}

export interface UpdateUserPayload {
  identification?: string;
  email?: string;
  full_name?: string;
  password?: string;
  is_active?: number;
}

type GetUserApiResponse = {
  status: 'success' | 'error';
  message?: string;
  data?: {
    users?: User[];
  };
};

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiBaseUrl = `${environment.apiBaseUrl}/users`;

  constructor(private http: HttpClient) {}

  // ── Obtener todos los usuarios ────────────────────────────
  getAllUsers(): Observable<User[]> {
    return this.http.get<GetUserApiResponse | User[]>(`${this.apiBaseUrl}/getAll`).pipe(
      tap((response) => {
        console.log('Usuarios API response:', response);
        if (typeof response !== 'object') {
          console.error('Respuesta inesperada al cargar usuarios', response);
          return;
        }
        if ('status' in response && response.status === 'error') {
          console.error('Error fetching users:', response.message);
        }
      }),
      map((response) => {
        const payload = response as unknown as {
          data?: any;
          users?: User[];
        };

        if (Array.isArray(response))          return response;
        if (payload?.data?.users)             return payload.data.users;
        if (Array.isArray(payload?.data?.user)) return payload.data.user;
        if (Array.isArray(payload?.data))     return payload.data;
        if (Array.isArray(payload?.users))    return payload.users;

        return [];
      })
    );
  }

  // ── Crear usuario ─────────────────────────────────────────
  createUser(payload: CreateUserPayload): Observable<any> {
    return this.http.post(`${this.apiBaseUrl}/create`, payload);
  }

  // ── Editar usuario ────────────────────────────────────────
  updateUser(id: number, payload: UpdateUserPayload): Observable<any> {
    return this.http.put(`${this.apiBaseUrl}/update/${id}`, payload);
  }

  // ── Eliminar usuario ──────────────────────────────────────
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiBaseUrl}/delete/${id}`);
  }
}