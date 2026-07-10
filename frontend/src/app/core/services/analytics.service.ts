import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnalyticsData, ApiResponse } from '../models/api-response.model';

const API_URL = 'http://localhost:5000/api/analytics';

/**
 * Analytics Service
 * Fetches data structured for chart displays.
 */
@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private http = inject(HttpClient);

  constructor() {}

  /**
   * Fetches data points for analytics charts
   */
  getAnalytics(): Observable<ApiResponse<AnalyticsData>> {
    return this.http.get<ApiResponse<AnalyticsData>>(API_URL);
  }
}
