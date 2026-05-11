import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

type LoginApiResponse = {
  status: 'success' | 'error';
  message?: string;
  data?: {
    access_token?: string;
    user?: any;
  };
};

@Injectable({ providedIn: 'root' })
export class LoginService {
  private readonly TOKEN_KEY = 'my_token_key';
  private readonly USER_KEY = 'my_user';

  private _token = signal<string | null>(this.getToken());
  token = computed(() => this._token());

  private _user = signal<any | null>(this.getUser());
  user = computed(() => this._user());

  constructor(private http: HttpClient) {}

  // 🔐 LOGIN
  login(email: string, password: string) {
    console.log('Intentando login con =>', { email, password });

    return this.http
      .post<LoginApiResponse>(`${environment.apiBaseUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          console.log('LOGIN RESPONSE =>', res);
        }),
        map((res) => {
          const token = res?.data?.access_token ?? null;
          const user = res?.data?.user ?? null;

          if (!token) {
            throw new Error('No llegó el token');
          }

          console.log('Token obtenido:', token);

          this.setToken(token);
          if (user) this.setUser(user);

          return { token, user };
        }),
      );
  }

  // 🆕 REGISTRO
  createUser(data: any) {
    console.log('Enviando registro =>', data);
    return this.http.post<any>(`${environment.apiBaseUrl}/auth/create`, data);
  }

  // 🔄 ACTUALIZAR DATOS (Nombre, Teléfono, Documento)
  updateUser(id: number, data: any) {
    console.log('Actualizando usuario =>', data);
    return this.http.put<any>(`${environment.apiBaseUrl}/auth/update/${id}`, data).pipe(
      tap((res) => {
        // Si el backend responde con el usuario actualizado, lo guardamos
        const updatedUser = res?.data?.user || data;
        this.setUser(updatedUser);
        console.log('Usuario actualizado en Signal y LocalStorage');
      })
    );
  }

  // 🔑 CAMBIAR CONTRASEÑA
  updatePassword(id: number, oldPassword: string, newPassword: string) {
    console.log('Cambiando contraseña para ID:', id);
    return this.http.put<any>(`${environment.apiBaseUrl}/auth/change-password/${id}`, {
      oldPassword,
      newPassword
    });
  }

  // --- MÉTODOS DE APOYO ---

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): any | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  private setUser(user: any) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._user.set(user); // Actualiza el Signal para que el Header cambie solo
  }

  private setToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
    this._token.set(token);
  }

  private clearToken() {
    localStorage.removeItem(this.TOKEN_KEY);
    this._token.set(null);
  }

  private clearUser() {
    localStorage.removeItem(this.USER_KEY);
    this._user.set(null);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout() {
    this.clearToken();
    this.clearUser();
  }
}