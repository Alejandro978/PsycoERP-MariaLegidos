import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, timer, EMPTY, lastValueFrom } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import {
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  User,
  TokenData,
  ApiError,
} from '../models';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private userService = inject(UserService);

  // Signals para el estado de autenticación
  private currentUser = signal<User | null>(null);
  private currentToken = signal<string | null>(null);
  private loading = signal(false);
  private tokenExpirationTime = signal<Date | null>(null);

  // Sujeto para el refresh automático
  private refreshTokenSubject$ = new BehaviorSubject<string | null>(null);
  private isRefreshing = false;

  // Computed signals para acceso público de solo lectura
  isAuthenticated = computed(
    () => this.currentUser() !== null && this.currentToken() !== null
  );
  isLoading = computed(() => this.loading());
  user = computed(() => this.currentUser());
  token = computed(() => this.currentToken());

  constructor() {
    // Verificar si hay una sesión guardada al iniciar
    this.checkStoredSession();
    // Iniciar el timer para auto-refresh
    this.startTokenRefreshTimer();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.loading.set(true);

    return this.http.post<LoginResponse>('/auth/login', credentials).pipe(
      tap((response: LoginResponse) => {
        this.handleLoginSuccess(response);
      }),
      catchError((error) => {
        this.loading.set(false);
        throw error;
      })
    );
  }

  async loginAsync(email: string, password: string): Promise<boolean> {
    try {
      const response = await lastValueFrom(this.login({ email, password }));
      return true;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    }
  }

  logout(): void {
    this.currentUser.set(null);
    this.currentToken.set(null);
    this.tokenExpirationTime.set(null);
    this.isRefreshing = false;

    localStorage.removeItem('auth_token');
    // Dejar que UserService limpie el usuario almacenado
    this.userService.clearProfile();
    localStorage.removeItem('token_expiration');

    this.refreshTokenSubject$.next(null);
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<RefreshResponse> {
    if (this.isRefreshing) {
      return this.refreshTokenSubject$.pipe(
        switchMap((token) => {
          if (token) {
            return this.http.post<RefreshResponse>('/auth/refresh', {});
          }
          return EMPTY;
        })
      );
    }

    this.isRefreshing = true;
    this.refreshTokenSubject$.next(null);

    return this.http.post<RefreshResponse>('/auth/refresh', {}).pipe(
      tap((response: RefreshResponse) => {
        this.handleRefreshSuccess(response.data);
        this.isRefreshing = false;
        this.refreshTokenSubject$.next(response.data.access_token);
      }),
      catchError((error) => {
        this.isRefreshing = false;
        this.logout();
        throw error;
      })
    );
  }

  private handleLoginSuccess(response: LoginResponse): void {
    const { user, token } = response.data;

    this.currentUser.set(user);
    this.currentToken.set(token.access_token);

    const expirationTime = this.calculateExpirationTime(token.expires_in);
    this.tokenExpirationTime.set(expirationTime);

    // Guardar en localStorage
    localStorage.setItem('auth_token', token.access_token);
    // Delegar persistencia del user a UserService
    this.userService.setProfile(user);
    localStorage.setItem('token_expiration', expirationTime.toISOString());

    this.loading.set(false);
  }

  private handleRefreshSuccess(tokenData: TokenData): void {
    this.currentToken.set(tokenData.access_token);

    const expirationTime = this.calculateExpirationTime(tokenData.expires_in);
    this.tokenExpirationTime.set(expirationTime);

    // Actualizar en localStorage
    localStorage.setItem('auth_token', tokenData.access_token);
    localStorage.setItem('token_expiration', expirationTime.toISOString());
  }

  private calculateExpirationTime(expiresIn: string): Date {
    const expirationDate = new Date();

    // Parsear "7d" formato
    if (expiresIn.endsWith('d')) {
      const days = parseInt(expiresIn.replace('d', ''));
      expirationDate.setDate(expirationDate.getDate() + days);
    } else if (expiresIn.endsWith('h')) {
      const hours = parseInt(expiresIn.replace('h', ''));
      expirationDate.setHours(expirationDate.getHours() + hours);
    } else if (expiresIn.endsWith('m')) {
      const minutes = parseInt(expiresIn.replace('m', ''));
      expirationDate.setMinutes(expirationDate.getMinutes() + minutes);
    } else {
      // Asumir segundos si no hay sufijo
      const seconds = parseInt(expiresIn);
      expirationDate.setSeconds(expirationDate.getSeconds() + seconds);
    }

    return expirationDate;
  }

  private checkStoredSession(): void {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('auth_token');
    const expirationString = localStorage.getItem('token_expiration');

    if (storedUser && token && expirationString) {
      try {
        const user = JSON.parse(storedUser);
        const expiration = new Date(expirationString);

        // Verificar si el token no ha expirado
        if (expiration > new Date()) {
          // Sincronizar con UserService
          this.userService.setProfile(user);
          this.currentUser.set(user);
          this.currentToken.set(token);
          this.tokenExpirationTime.set(expiration);
        } else {
          // Token expirado, limpiar
          this.logout();
        }
      } catch (error) {
        console.error('Error al recuperar sesión:', error);
        this.logout();
      }
    }
  }

  private startTokenRefreshTimer(): void {
    // Verificar cada 5 minutos si necesita refresh
    timer(0, 5 * 60 * 1000).pipe(
      switchMap(() => {
        const expirationTime = this.tokenExpirationTime();
        if (!expirationTime || !this.isAuthenticated()) {
          return EMPTY;
        }

        const now = new Date();
        const timeUntilExpiration = expirationTime.getTime() - now.getTime();
        const refreshThreshold = this.calculateRefreshThreshold(expirationTime);

        if (
          timeUntilExpiration <= refreshThreshold &&
          timeUntilExpiration > 0
        ) {
          return this.refreshToken();
        }

        return EMPTY;
      })
    );
  }

  /**
   * Calcula cuándo debe ejecutarse el refresh del token basándose en su duración total.
   *
   * Estrategia inteligente:
   * - Tokens ≥ 7 días: refresh 24 horas antes de expirar
   * - Tokens 1-7 días: refresh 4 horas antes de expirar
   * - Tokens < 1 día: refresh 30 minutos antes de expirar
   *
   * Esto evita renovaciones excesivas en tokens de larga duración mientras
   * mantiene la seguridad para tokens de corta duración.
   *
   * @param expirationTime Fecha de expiración del token actual
   * @returns Tiempo en milisegundos antes de la expiración para hacer refresh
   */
  private calculateRefreshThreshold(expirationTime: Date): number {
    // Obtener la fecha de creación del token desde localStorage para calcular lifetime total
    const storedUser = localStorage.getItem('user');
    const userLastLogin = storedUser ? JSON.parse(storedUser).last_login : null;

    let tokenLifetimeDays = 7; // Asumir 7 días por defecto

    if (userLastLogin) {
      const loginTime = new Date(userLastLogin);
      const totalLifetime = expirationTime.getTime() - loginTime.getTime();
      tokenLifetimeDays = totalLifetime / (24 * 60 * 60 * 1000);
    }

    // Estrategia basada en la duración total del token
    if (tokenLifetimeDays >= 7) {
      return 24 * 60 * 60 * 1000; // 24 horas antes para tokens de 7+ días
    } else if (tokenLifetimeDays >= 1) {
      return 4 * 60 * 60 * 1000; // 4 horas antes para tokens de 1-7 días
    } else {
      return 30 * 60 * 1000; // 30 minutos antes para tokens cortos
    }
  }
}
