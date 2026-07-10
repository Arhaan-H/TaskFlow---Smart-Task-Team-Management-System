import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User, AuthResponse, LoginDto, RegisterDto } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';

const API_URL = 'http://localhost:5000/api/auth';

/**
 * Authentication Service
 * Manages user sessions, registration, login, and profile updates.
 * Uses Angular Signals for reactive state tracking.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Signals representing Auth State
  currentUser = signal<User | null>(null);
  
  // Computed signal that derives login status
  isAuthenticated = computed(() => !!this.currentUser());

  constructor() {
    // Attempt to load session on application start
    const token = this.getToken();
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        this.currentUser.set(JSON.parse(savedUser));
        // Retrieve fresh profile from database to ensure sync
        this.getProfile().subscribe({
          error: () => this.logout() // Logout if token is invalid or expired
        });
      } catch (e) {
        this.logout();
      }
    }
  }

  /**
   * Registers a new user
   */
  register(dto: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}/register`, dto).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  /**
   * Logs in a user
   */
  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}/login`, dto).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  /**
   * Refreshes the user profile from backend
   */
  getProfile(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${API_URL}/profile`).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.currentUser.set(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        }
      })
    );
  }

  /**
   * Updates current user's profile text and avatar upload
   */
  updateProfile(formData: FormData): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${API_URL}/profile`, formData).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.currentUser.set(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        }
      })
    );
  }

  /**
   * Changes the user's password
   */
  changePassword(data: any): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${API_URL}/change-password`, data);
  }

  /**
   * Clears the current session and redirects to Login page
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Returns stored JWT token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Saves credentials upon successful registration/login
   */
  private handleAuthSuccess(res: AuthResponse): void {
    if (res.success && res.token && res.user) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      this.currentUser.set(res.user);
    }
  }
}
