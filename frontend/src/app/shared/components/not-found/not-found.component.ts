import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * 404 Not Found Component
 * Rendered when a user navigates to an undefined URL route.
 * Features a modern card design with subtle entry animations.
 */
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 transition-colors">
      <div class="max-w-md w-full text-center tf-card fade-in">
        <!-- 404 Error code -->
        <h1 class="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 leading-none">
          404
        </h1>
        
        <!-- Error descriptions -->
        <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-4">
          Page Not Found
        </h2>
        <p class="text-slate-500 dark:text-slate-400 mt-2 mb-6">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <!-- Redirect action button -->
        <button mat-raised-button color="primary" routerLink="/dashboard" class="flex items-center justify-center mx-auto gap-2">
          <mat-icon>home</mat-icon>
          Return to Dashboard
        </button>
      </div>
    </div>
  `
})
export class NotFoundComponent {}
