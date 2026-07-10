import { Component, inject } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

/**
 * Confirm Dialog Component
 * Reusable modal popup to prompt the user before performing destructive
 * actions (like deleting a project or task).
 * Receives config data using the MAT_DIALOG_DATA token.
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title class="font-bold text-slate-800 dark:text-slate-100">
      {{ data.title || 'Are you sure?' }}
    </h2>
    <mat-dialog-content class="text-slate-600 dark:text-slate-300">
      <p>{{ data.message || 'Do you really want to perform this action? This cannot be undone.' }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="gap-2 pb-4 pr-6">
      <!-- Cancel action closes dialog and returns false/undefined -->
      <button mat-button mat-dialog-close>Cancel</button>
      
      <!-- Confirm action closes dialog and returns true -->
      <button mat-raised-button color="warn" [mat-dialog-close]="true">
        Confirm
      </button>
    </mat-dialog-actions>
  `
})
export class ConfirmDialogComponent {
  // Injected token containing configuration title & message
  public data = inject<{ title?: string; message?: string }>(MAT_DIALOG_DATA);
}
