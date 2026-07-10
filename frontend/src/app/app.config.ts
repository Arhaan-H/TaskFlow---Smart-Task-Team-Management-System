import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/core';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';

/**
 * Application Config
 * Sets up global providers for Angular v21.
 * Since we don't have NgModules, we configure routing, HTTP client with functional
 * interceptors, date adapter for datepickers, and Material animations here.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // 1. Optimize zone change detection
    provideZoneChangeDetection({ eventCoalescing: true }),
    
    // 2. Setup application router with lazy routing definitions
    provideRouter(routes),
    
    // 3. Setup HttpClient equipped with functional interceptors
    provideHttpClient(
      withInterceptors([authInterceptor, loadingInterceptor])
    ),
    
    // 4. Setup asynchronous animations required by Angular Material
    provideAnimationsAsync(),

    // 5. Global Date adapter for MatDatepicker
    provideNativeDateAdapter()
  ]
};
