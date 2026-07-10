import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Navbar Component
 * Top horizontal toolbar that displays current section title,
 * theme toggler (dark/light mode), and user options menu.
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink,
    MatToolbarModule, 
    MatButtonModule, 
    MatIconModule, 
    MatMenuModule
  ],
  template: `
    <mat-toolbar class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700/50 px-4 md:px-6 flex justify-between h-16 transition-colors">
      
      <!-- Left side: Route-based Page Title -->
      <div class="flex items-center gap-2">
        <h2 class="text-lg md:text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 capitalise">
          {{ pageTitle() }}
        </h2>
      </div>

      <!-- Right side: Theme toggle and User dropdown actions -->
      <div class="flex items-center gap-2 md:gap-3">
        <!-- Theme Toggler (Dark/Light mode) -->
        <button 
          mat-icon-button 
          (click)="themeService.toggleDarkMode()" 
          title="Toggle Dark/Light Mode"
          class="text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <mat-icon>{{ themeService.isDarkMode() ? 'light_mode' : 'dark_mode' }}</mat-icon>
        </button>

        <!-- Profile drop-down trigger -->
        <button 
          *ngIf="authService.currentUser() as user" 
          [matMenuTriggerFor]="userMenu"
          class="flex items-center gap-2 text-left hover:opacity-90 border border-slate-200 dark:border-slate-700 rounded-full p-1 pl-1 pr-3 focus:outline-none"
        >
          <!-- User avatar -->
          <div class="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 border border-blue-500/30 flex items-center justify-center font-bold overflow-hidden flex-shrink-0">
            <img 
              *ngIf="user.avatar" 
              [src]="'http://localhost:5000/' + user.avatar" 
              [alt]="user.name"
              class="w-full h-full object-cover"
            />
            <span *ngIf="!user.avatar">{{ user.name.charAt(0).toUpperCase() }}</span>
          </div>

          <!-- User short name on desktop -->
          <span class="hidden md:inline text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
            {{ user.name.split(' ')[0] }}
          </span>
          <mat-icon class="hidden md:inline text-slate-400 text-sm">keyboard_arrow_down</mat-icon>
        </button>

        <!-- User Options Dropdown menu -->
        <mat-menu #userMenu="matMenu" xPosition="before" class="dark:bg-slate-800 border dark:border-slate-700">
          <div class="px-4 py-3 border-b border-slate-100 dark:border-slate-700/50" *ngIf="authService.currentUser() as user">
            <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ user.name }}</p>
            <p class="text-xs text-slate-400 truncate mt-0.5">{{ user.email }}</p>
          </div>

          <button mat-menu-item routerLink="/profile" class="text-slate-700 dark:text-slate-300">
            <mat-icon class="text-slate-400">person</mat-icon>
            <span>My Profile</span>
          </button>

          <button mat-menu-item (click)="authService.logout()" class="text-red-600 dark:text-red-400">
            <mat-icon class="text-red-500 dark:text-red-400">logout</mat-icon>
            <span>Sign Out</span>
          </button>
        </mat-menu>
      </div>

    </mat-toolbar>
  `,
  styles: [`
    .mat-toolbar {
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
    }
  `]
})
export class NavbarComponent {
  public themeService = inject(ThemeService);
  public authService = inject(AuthService);
  private router = inject(Router);

  // Convert router events into a signal
  private navigationEnd = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => (event as NavigationEnd).urlAfterRedirects)
    )
  );

  // Compute page title based on current router URL
  pageTitle = computed(() => {
    const url = this.navigationEnd() || this.router.url;
    if (url.includes('/dashboard')) return 'Dashboard Overview';
    if (url.includes('/projects/')) return 'Project Details';
    if (url.includes('/projects')) return 'Project Workspace';
    if (url.includes('/tasks')) return 'Task Board';
    if (url.includes('/profile')) return 'Account Center';
    return 'TaskFlow';
  });
}
