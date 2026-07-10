import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';

/**
 * Global Routing Table
 * Implements lazy loading for all page feature modules/components.
 * Lazy loading ensures that only the required JS files are loaded on demand,
 * improving application startup and bundle sizing.
 */
export const routes: Routes = [
  // 1. Redirect root URL to Dashboard page
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // 2. Unauthenticated Routes (Login & Register) - blocked for logged-in users
  {
    path: 'auth',
    canActivate: [noAuthGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  // 3. Protected Dashboard & Workspace Routes - requires user login
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'projects',
        loadComponent: () => import('./features/projects/project-list/project-list.component').then(m => m.ProjectListComponent)
      },
      {
        path: 'projects/:id',
        loadComponent: () => import('./features/projects/project-detail/project-detail.component').then(m => m.ProjectDetailComponent)
      },
      {
        path: 'tasks',
        loadComponent: () => import('./features/tasks/task-list/task-list.component').then(m => m.TaskListComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  },

  // 4. Catch-all fallback route (404 Page Not Found)
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
