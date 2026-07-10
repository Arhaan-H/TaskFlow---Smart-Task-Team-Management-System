import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../../../core/services/loading.service';

/**
 * Loading Spinner Component
 * Displays a full-screen blurred backdrop overlay with a spinning loader
 * whenever an asynchronous API operation is executing.
 */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="loading-overlay" *ngIf="loadingService.isLoading$ | async">
      <mat-spinner diameter="60" color="primary" aria-label="Loading contents"></mat-spinner>
    </div>
  `
})
export class LoadingSpinnerComponent {
  // Inject the singleton LoadingService to access the isLoading$ observable
  public loadingService = inject(LoadingService);
}
