import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Loading Service
 * Manages global loading spinner state.
 * Used by the loading interceptor to show a spinner during HTTP requests.
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  
  // Public observable that components can subscribe to (e.g. LoadingSpinnerComponent)
  public isLoading$ = this.loadingSubject.asObservable();

  constructor() {}

  /**
   * Shows the global spinner
   */
  show(): void {
    this.loadingSubject.next(true);
  }

  /**
   * Hides the global spinner
   */
  hide(): void {
    this.loadingSubject.next(false);
  }
}
