import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Toast Service
 * Wraps Angular Material's MatSnackBar to display non-blocking alerts (toasts)
 * in different states (success, error, info).
 */
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private snackBar = inject(MatSnackBar);

  constructor() {}

  /**
   * Displays a green success notification
   */
  success(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['snack-success']
    });
  }

  /**
   * Displays a red error notification
   */
  error(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['snack-error']
    });
  }

  /**
   * Displays a blue informational notification
   */
  info(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['snack-info']
    });
  }
}
