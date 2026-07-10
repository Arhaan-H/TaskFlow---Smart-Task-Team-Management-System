import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Sidebar Component
 * Left vertical navigation panel for authenticated workspace.
 * Uses Angular Signals to display user details and handle logout.
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule],
  template: `
    <div class="h-screen bg-slate-800 text-slate-100 flex flex-col justify-between border-r border-slate-700/50">
      
      <!-- Brand Logo Header -->
      <div>
        <div class="h-16 flex items-center px-6 gap-3 border-b border-slate-700/50">
          <div class="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-blue-500/20">
            T
          </div>
          <span class="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            TaskFlow
          </span>
        </div>

        <!-- Navigation Link Lists -->
        <nav class="p-4 space-y-1">
          <a 
            routerLink="/dashboard" 
            routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-600/10" 
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200"
          >
            <mat-icon class="text-lg">dashboard</mat-icon>
            <span class="font-medium text-sm">Dashboard</span>
          </a>

          <a 
            routerLink="/projects" 
            routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-600/10" 
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200"
          >
            <mat-icon class="text-lg">folder</mat-icon>
            <span class="font-medium text-sm">Projects</span>
          </a>

          <a 
            routerLink="/tasks" 
            routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-600/10" 
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200"
          >
            <mat-icon class="text-lg">task_alt</mat-icon>
            <span class="font-medium text-sm">Tasks</span>
          </a>

          <a 
            routerLink="/profile" 
            routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-600/10" 
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200"
          >
            <mat-icon class="text-lg">person</mat-icon>
            <span class="font-medium text-sm">Profile</span>
          </a>
        </nav>
      </div>

      <!-- Bottom User Details & Logout Actions -->
      <div class="p-4 border-t border-slate-700/50" *ngIf="authService.currentUser() as user">
        <!-- User summary -->
        <div class="flex items-center gap-3 px-2 py-3 mb-2">
          <!-- Avatar picture or initials fallback -->
          <div class="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-base overflow-hidden flex-shrink-0">
            <img 
              *ngIf="user.avatar" 
              [src]="'http://localhost:5000/' + user.avatar" 
              [alt]="user.name"
              class="w-full h-full object-cover"
            />
            <span *ngIf="!user.avatar">{{ user.name.substring(0, 2).toUpperCase() }}</span>
          </div>
          <div class="min-w-0">
            <h4 class="font-semibold text-sm truncate text-white leading-tight">
              {{ user.name }}
            </h4>
            <p class="text-xs text-slate-400 truncate mt-0.5">
              {{ user.email }}
            </p>
          </div>
        </div>

        <!-- Logout button -->
        <button 
          mat-stroked-button 
          color="warn" 
          class="w-full flex items-center justify-center gap-2 border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-red-400 transition-colors"
          (click)="onLogout()"
        >
          <mat-icon class="text-sm">logout</mat-icon>
          Sign Out
        </button>
      </div>

    </div>
  `
})
export class SidebarComponent {
  // Inject auth service to read active user session details
  public authService = inject(AuthService);

  /**
   * Triggers authentication logout
   */
  onLogout(): void {
    this.authService.logout();
  }
}
