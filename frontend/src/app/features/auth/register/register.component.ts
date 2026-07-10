import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

/**
 * Custom Validator to verify passwords match
 */
function passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  
  if (!password || !confirmPassword) return null;
  
  if (password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
  
  return null;
}

/**
 * Register Component
 * User sign up page with password strength checks and confirmation validation.
 */
@Component({
  selector: 'app-register',
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
      <div class="hidden lg:flex lg:col-span-7 bg-gradient-to-tr from-indigo-700 via-blue-600 to-blue-700 items-center justify-center p-12 text-white relative overflow-hidden">
        <!-- Abstract gradient shapes -->
        <div class="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -top-12 -left-12"></div>
        <div class="absolute w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -bottom-12 -right-12"></div>
        
        <div class="max-w-md space-y-6 z-10 slide-in-left">
          <div class="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center font-extrabold text-2xl shadow-xl">
            T
          </div>
          <h1 class="text-4xl font-extrabold tracking-tight leading-tight">
            Plan, Track, and Celebrate Milestones
          </h1>
          <p class="text-blue-100 text-lg leading-relaxed">
            Create projects, delegate tasks, configure timelines, and track metrics. Organize your workflows efficiently.
          </p>
        </div>
      </div>

      <!-- Right form column -->
      <div class="col-span-1 lg:col-span-5 flex items-center justify-center p-6 sm:p-12">
        <div class="max-w-sm w-full space-y-6 fade-in">
          
          <!-- Headers -->
          <div class="text-center lg:text-left">
            <h2 class="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
              Create Account
            </h2>
            <p class="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
              Register now to start building your work teams.
            </p>
          </div>

          <!-- Register form -->
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-3">
            
            <!-- Full Name Input -->
            <mat-form-field appearance="outline">
              <mat-label>Full Name</mat-label>
              <input 
                matInput 
                formControlName="name" 
                placeholder="John Doe" 
                autocomplete="name"
              />
              <mat-icon matSuffix class="text-slate-400">person</mat-icon>
              <mat-error *ngIf="registerForm.get('name')?.hasError('required')">
                Full name is required.
              </mat-error>
              <mat-error *ngIf="registerForm.get('name')?.hasError('minlength')">
                Name must be at least 2 characters.
              </mat-error>
            </mat-form-field>

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
              <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
                Email address is required.
              </mat-error>
              <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
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
                placeholder="Enter strong password"
                autocomplete="new-password"
              />
              <button 
                type="button" 
                mat-icon-button 
                matSuffix 
                (click)="togglePasswordVisibility($event)"
                class="text-slate-400"
              >
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
                Password is required.
              </mat-error>
              <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
                Password must be at least 6 characters.
              </mat-error>
              <mat-error *ngIf="registerForm.get('password')?.hasError('pattern')">
                Must contain uppercase, lowercase, number, and special character.
              </mat-error>
            </mat-form-field>

            <!-- Confirm Password Input -->
            <mat-form-field appearance="outline">
              <mat-label>Confirm Password</mat-label>
              <input 
                matInput 
                [type]="hidePassword() ? 'password' : 'text'" 
                formControlName="confirmPassword" 
                placeholder="Confirm password"
                autocomplete="new-password"
              />
              <mat-icon matSuffix class="text-slate-400">lock</mat-icon>
              <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
                Password confirmation is required.
              </mat-error>
              <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('passwordMismatch')">
                Passwords do not match.
              </mat-error>
            </mat-form-field>

            <!-- Submit trigger -->
            <button 
              mat-flat-button 
              color="primary" 
              type="submit" 
              [disabled]="registerForm.invalid || isLoading()" 
              class="w-full py-6 text-base font-semibold shadow-md shadow-blue-500/10 rounded-lg flex items-center justify-center"
            >
              <mat-spinner diameter="20" *ngIf="isLoading()" color="accent" class="mr-2"></mat-spinner>
              {{ isLoading() ? 'Registering...' : 'Register' }}
            </button>
          </form>

          <!-- Redirect anchor -->
          <div class="text-center lg:text-left text-sm text-slate-500 dark:text-slate-400 mt-4">
            Already have an account? 
            <a routerLink="/auth/login" class="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
              Log In
            </a>
          </div>

        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  // States
  hidePassword = signal<boolean>(true);
  isLoading = signal<boolean>(false);

  // Password rules matches uppercase, lowercase, number, and special character
  private passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

  registerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.required, 
      Validators.minLength(6),
      Validators.pattern(this.passwordPattern)
    ]],
    confirmPassword: ['', [Validators.required]]
  }, {
    validators: passwordMatchValidator
  });

  constructor() {}

  /**
   * Toggles password visibility
   */
  togglePasswordVisibility(event: MouseEvent): void {
    event.stopPropagation();
    this.hidePassword.update(hide => !hide);
  }

  /**
   * Submits registration request
   */
  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isLoading.set(true);
    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.toast.success(res.message || 'Registration successful!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        const errorMsg = err.error?.message || 'Registration failed. Email might already exist.';
        this.toast.error(errorMsg);
      }
    });
  }
}
