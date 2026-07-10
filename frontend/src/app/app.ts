import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';

/**
 * Root Application Component
 * Acts as the bootstrapper shell, hosting the global loading spinner
 * and the primary router outlet where active page modules are rendered.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingSpinnerComponent],
  template: `
    <!-- Global application loading spinner overlay -->
    <app-loading-spinner />
    
    <!-- Main content router outlet -->
    <router-outlet />
  `
})
export class App {
  title = 'TaskFlow';
}
