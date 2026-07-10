import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { ThemeService } from '../../core/services/theme.service';

/**
 * Main Layout Component
 * Serves as the primary authenticated dashboard shell.
 * Integrates the responsive Sidebar, Top Navbar, and page RouterOutlet.
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, NavbarComponent],
  template: `
    <!-- Top-level layout container binding dark mode theme signal -->
    <div 
      class="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300"
      [attr.data-theme]="themeService.isDarkMode() ? 'dark' : 'light'"
    >
      <!-- Fixed Left Sidebar Panel -->
      <app-sidebar class="hidden md:block w-64 flex-shrink-0" />

      <!-- Primary Content Area -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Top Navigation Bar -->
        <app-navbar />

        <!-- Router Outlet Content Container -->
        <main class="flex-1 overflow-y-auto p-4 md:p-6 max-w-[var(--content-max-width)] w-full mx-auto">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class MainLayoutComponent {
  // Inject theme service to query the current theme state
  public themeService = inject(ThemeService);
}
