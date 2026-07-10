import { Pipe, PipeTransform } from '@angular/core';

/**
 * Time Ago Pipe
 * Converts a standard date string or timestamp into a relative human-readable
 * time format (e.g. '2 hours ago', 'yesterday', 'just now').
 */
@Pipe({
  name: 'timeAgo',
  standalone: true
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: any): string {
    if (!value) return '';

    const date = new Date(value);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 29) return 'Just now';

    const intervals: { [key: string]: number } = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1
    };

    let counter;
    for (const key in intervals) {
      counter = Math.floor(seconds / intervals[key]);
      if (counter > 0) {
        if (counter === 1) {
          return `${counter} ${key} ago`; // singular (e.g. 1 day ago)
        } else {
          return `${counter} ${key}s ago`; // plural (e.g. 2 days ago)
        }
      }
    }
    return 'Just now';
  }
}
