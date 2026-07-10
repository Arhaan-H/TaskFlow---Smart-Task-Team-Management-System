import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Functional No-Auth Guard
 * Redirects logged-in users away from authentication pages (login, register)
 * back to the dashboard.
 */
export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  // Redirect authenticated user to dashboard
  router.navigate(['/dashboard']);
  return false;
};
