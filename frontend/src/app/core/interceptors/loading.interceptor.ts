import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

// Keep track of active requests to prevent early hiding of the spinner
let activeRequests = 0;

/**
 * Functional Loading Interceptor
 * Displays a loading spinner overlay when HTTP requests are active.
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Skip showing spinner for background analytics or dashboard polls if desired,
  // but for a general app showing it is fine.
  activeRequests++;
  loadingService.show();

  return next(req).pipe(
    finalize(() => {
      activeRequests--;
      if (activeRequests <= 0) {
        activeRequests = 0;
        loadingService.hide();
      }
    })
  );
};
