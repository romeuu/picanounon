import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import {
  AuthResponse,
  AuthUser,
  GoogleTokenRequest,
  LoginRequest,
  RegisterRequest,
} from '../models/interfaces/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly TOKEN_KEY = 'picanounon_auth_token';
  private readonly USER_KEY = 'picanounon_auth_user';
  private readonly baseUrl = environment.apiUrl;

  readonly currentUser = signal<AuthUser | null>(this.getInitialUser());
  readonly token = signal<string | null>(this.getInitialToken());
  readonly isAuthenticated = computed(() => !!this.currentUser() && !!this.token());
  readonly isLoading = signal<boolean>(false);

  private getInitialToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  private getInitialUser(): AuthUser | null {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem(this.USER_KEY);
      if (savedUser) {
        try {
          return JSON.parse(savedUser) as AuthUser;
        } catch {
          localStorage.removeItem(this.USER_KEY);
        }
      }
    }
    return null;
  }

  getToken(): string | null {
    return this.token();
  }

  saveSession(authResponse: AuthResponse): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, authResponse.accessToken);
      localStorage.setItem(this.USER_KEY, JSON.stringify(authResponse.user));
    }
    this.token.set(authResponse.accessToken);
    this.currentUser.set(authResponse.user);
  }

  clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.token.set(null);
    this.currentUser.set(null);
  }

  login(credentials: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    this.isLoading.set(true);
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.baseUrl}/auth/login`, credentials)
      .pipe(
        tap({
          next: (res) => {
            this.isLoading.set(false);
            if (res.data) {
              this.saveSession(res.data);
            }
          },
          error: () => {
            this.isLoading.set(false);
          },
        })
      );
  }

  register(data: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    this.isLoading.set(true);
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.baseUrl}/auth/register`, data)
      .pipe(
        tap({
          next: (res) => {
            this.isLoading.set(false);
            if (res.data) {
              this.saveSession(res.data);
            }
          },
          error: () => {
            this.isLoading.set(false);
          },
        })
      );
  }

  loginWithGoogle(idToken: string): Observable<ApiResponse<AuthResponse>> {
    this.isLoading.set(true);
    const body: GoogleTokenRequest = { idToken };
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.baseUrl}/auth/google`, body)
      .pipe(
        tap({
          next: (res) => {
            this.isLoading.set(false);
            if (res.data) {
              this.saveSession(res.data);
            }
          },
          error: () => {
            this.isLoading.set(false);
          },
        })
      );
  }

  getMe(): Observable<ApiResponse<AuthUser>> {
    return this.http.get<ApiResponse<AuthUser>>(`${this.baseUrl}/auth/me`).pipe(
      tap({
        next: (res) => {
          if (res.data) {
            this.currentUser.set(res.data);
            if (typeof window !== 'undefined') {
              localStorage.setItem(this.USER_KEY, JSON.stringify(res.data));
            }
          }
        },
        error: (err) => {
          if (err.status === 401) {
            this.clearSession();
          }
        },
      })
    );
  }

  logout(): void {
    this.clearSession();
  }
}
