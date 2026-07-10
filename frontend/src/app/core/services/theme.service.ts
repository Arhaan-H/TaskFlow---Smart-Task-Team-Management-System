import { Injectable, signal, effect } from '@angular/core';

/**
 * Theme Service
 * Manages the light / dark theme state using Angular Signals.
 * Persists user preference to localStorage.
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Angular Signal representing the dark mode state
  isDarkMode = signal<boolean>(false);

  constructor() {
    // 1. Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkMode.set(savedTheme === 'dark');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkMode.set(prefersDark);
    }

    // 2. React to changes in the signal to update HTML element attribute
    effect(() => {
      const mode = this.isDarkMode() ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', mode);
      localStorage.setItem('theme', mode);
    });
  }

  /**
   * Toggles the current theme
   */
  toggleDarkMode(): void {
    this.isDarkMode.update(dark => !dark);
  }
}
