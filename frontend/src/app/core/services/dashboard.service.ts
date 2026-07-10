import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStats, ApiResponse } from '../models/api-response.model';

const API_URL = 'http://localhost:5000/api/dashboard';

/**
 * Dashboard Service
 * Fetches summary statistics for user metrics.
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);

  constructor() {}

  /**
   * Fetches aggregated dashboard metrics
   */
  getDashboard(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(API_URL);
  }
}
