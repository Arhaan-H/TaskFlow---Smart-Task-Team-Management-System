import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Functional Authentication Interceptor
 * Injects token into outbound HTTP requests and handles auth errors (401).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  let modifiedReq = req;

  // 1. Attach Bearer token if it exists in localStorage
  if (token) {
    modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // 2. Process request and intercept response errors
  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If server returns 401 Unauthorized, automatically log out user
      if (error.status === 401) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
