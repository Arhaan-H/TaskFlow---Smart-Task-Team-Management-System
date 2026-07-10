import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project, CreateProjectDto, ProjectsResponse } from '../models/project.model';
import { ApiResponse } from '../models/api-response.model';

const API_URL = 'http://localhost:5000/api/projects';

/**
 * Project Service
 * Handles all backend HTTP communication for Project CRUD operations.
 */
@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private http = inject(HttpClient);

  constructor() {}

  /**
   * Fetches projects with optional query/search/pagination params
   */
  getProjects(params?: { search?: string; status?: string; page?: number; limit?: number }): Observable<ProjectsResponse> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    }

    return this.http.get<ProjectsResponse>(API_URL, { params: httpParams });
  }

  /**
   * Creates a new project
   */
  createProject(dto: CreateProjectDto): Observable<ApiResponse<Project>> {
    return this.http.post<ApiResponse<Project>>(API_URL, dto);
  }

  /**
   * Fetches a project by ID
   */
  getProject(id: string): Observable<ApiResponse<Project>> {
    return this.http.get<ApiResponse<Project>>(`${API_URL}/${id}`);
  }

  /**
   * Updates an existing project
   */
  updateProject(id: string, dto: CreateProjectDto): Observable<ApiResponse<Project>> {
    return this.http.put<ApiResponse<Project>>(`${API_URL}/${id}`, dto);
  }

  /**
   * Deletes a project and cascades deletion to all project tasks
   */
  deleteProject(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${API_URL}/${id}`);
  }
}
