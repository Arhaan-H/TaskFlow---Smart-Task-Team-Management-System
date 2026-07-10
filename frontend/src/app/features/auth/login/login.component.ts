import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

/**
 * Login Component
 * Secure user login screen using reactive form validations.
 * Features a modern two-column premium visual layout on desktop.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      
      <!-- Left decorative column (hidden on mobile) -->
      <div class="hidden lg:flex lg:col-span-7 bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-700 items-center justify-center p-12 text-white relative overflow-hidden">
        <!-- Abstract gradient shapes -->
        <div class="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -top-12 -left-12"></div>
        <div class="absolute w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -bottom-12 -right-12"></div>
        
        <div class="max-w-md space-y-6 z-10 slide-in-left">
          <div class="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center font-extrabold text-2xl shadow-xl">
            T
          </div>
          <h1 class="text-4xl font-extrabold tracking-tight leading-tight">
            Smart Team & Project Collaboration Start Here
          </h1>
          <p class="text-blue-100 text-lg leading-relaxed">
            TaskFlow makes organizing projects, tracking schedules, and communicating workloads simpler, modern, and completely visual.
          </p>
          <div class="flex items-center gap-4 pt-4">
            <div class="flex -space-x-2">
              <div class="w-8 h-8 rounded-full border-2 border-blue-600 bg-slate-300 flex items-center justify-center text-xs font-bold text-slate-800">JD</div>
              <div class="w-8 h-8 rounded-full border-2 border-blue-600 bg-blue-400 flex items-center justify-center text-xs font-bold text-white">AS</div>
              <div class="w-8 h-8 rounded-full border-2 border-blue-600 bg-emerald-400 flex items-center justify-center text-xs font-bold text-slate-800">BL</div>
            </div>
            <span class="text-xs text-blue-200 font-semibold">Join thousands of teams globally</span>
          </div>
        </div>
      </div>

      <!-- Right form column -->
      <div class="col-span-1 lg:col-span-5 flex items-center justify-center p-6 sm:p-12">
        <div class="max-w-sm w-full space-y-8 fade-in">
          
          <!-- Logo & headers -->
          <div class="text-center lg:text-left">
            <h2 class="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
              Welcome Back
            </h2>
            <p class="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              Please enter your details to sign in to your dashboard.
            </p>
          </div>

          <!-- Login reactive form -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- Email Input -->
            <mat-form-field appearance="outline">
              <mat-label>Email Address</mat-label>
              <input 
                matInput 
                formControlName="email" 
                type="email" 
                placeholder="you@example.com" 
                autocomplete="email"
              />
              <mat-icon matSuffix class="text-slate-400">mail</mat-icon>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                Email address is required.
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                Please enter a valid email address.
              </mat-error>
            </mat-form-field>

            <!-- Password Input -->
            <mat-form-field appearance="outline">
              <mat-label>Password</mat-label>
              <input 
                matInput 
                [type]="hidePassword() ? 'password' : 'text'" 
                formControlName="password" 
                placeholder="Enter password"
                autocomplete="current-password"
              />
              <button 
                type="button" 
                mat-icon-button 
                matSuffix 
                (click)="togglePasswordVisibility($event)" 
                [attr.aria-label]="'Hide password'" 
                [attr.aria-pressed]="hidePassword()"
                class="text-slate-400"
              >
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Password is required.
              </mat-error>
            </mat-form-field>

            <!-- Submit trigger -->
            <button 
              mat-flat-button 
              color="primary" 
              type="submit" 
              [disabled]="loginForm.invalid || isLoading()" 
              class="w-full py-6 text-base font-semibold shadow-md shadow-blue-500/10 rounded-lg flex items-center justify-center"
            >
              <mat-spinner diameter="20" *ngIf="isLoading()" color="accent" class="mr-2"></mat-spinner>
              {{ isLoading() ? 'Signing In...' : 'Sign In' }}
            </button>
          </form>

          <!-- Alternative redirect -->
          <div class="text-center lg:text-left text-sm text-slate-500 dark:text-slate-400 mt-6">
            Don't have an account? 
            <a routerLink="/auth/register" class="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
              Create one now
            </a>
          </div>

        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  // States
  hidePassword = signal<boolean>(true);
  isLoading = signal<boolean>(false);

  // Reactive Form definition
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  constructor() {}

  /**
   * Toggles secure password characters visibility
   */
  togglePasswordVisibility(event: MouseEvent): void {
    event.stopPropagation();
    this.hidePassword.update(hide => !hide);
  }

  /**
   * Submits user credentials to backend
   */
  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.toast.success(res.message || 'Login successful!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        const errorMsg = err.error?.message || 'Login failed. Please check credentials.';
        this.toast.error(errorMsg);
      }
    });
  }
}
