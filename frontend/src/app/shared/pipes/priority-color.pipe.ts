import { Pipe, PipeTransform } from '@angular/core';

/**
 * Priority Color Pipe
 * Takes a task priority string ('low', 'medium', 'high') and returns
 * the corresponding CSS class for styling the priority badge.
 */
@Pipe({
  name: 'priorityColor',
  standalone: true
})
export class PriorityColorPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    
    switch (value.toLowerCase()) {
      case 'low':
        return 'badge-low';
      case 'medium':
        return 'badge-medium';
      case 'high':
        return 'badge-high';
      default:
        return 'badge-medium';
    }
  }
}
