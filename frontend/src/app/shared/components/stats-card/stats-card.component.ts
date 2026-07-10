import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

/**
 * Stats Card Component
 * Reusable layout card to display a metric with an icon, numeric value,
 * title, and optional badge or description.
 */
@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="stats-card">
      <!-- Circular icon container with dynamic background color mapping -->
      <div 
        class="stats-icon text-white" 
        [style.background-color]="color"
        aria-hidden="true"
      >
        <mat-icon>{{ icon }}</mat-icon>
      </div>

      <!-- Metric content -->
      <div class="flex-1 min-w-0">
        <div class="stats-value" [attr.aria-label]="value + ' ' + title">
          {{ value }}
        </div>
        <div class="stats-label truncate">
          {{ title }}
        </div>
        <div *ngIf="subtitle" class="text-xs text-slate-400 dark:text-slate-500 mt-1 truncate">
          {{ subtitle }}
        </div>
      </div>
    </div>
  `
})
export class StatsCardComponent {
  // Title / Label describing the metric (e.g. 'Completed Tasks')
  @Input() title: string = '';

  // Numeric count or value to display
  @Input() value: number | string = 0;

  // Material Icon string identifier (e.g. 'check_circle')
  @Input() icon: string = 'show_chart';

  // CSS hex color code representing the background color for the icon circle
  @Input() color: string = '#3b82f6';

  // Optional descriptive text shown below the label
  @Input() subtitle?: string;
}
