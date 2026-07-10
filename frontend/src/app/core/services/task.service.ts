import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, CreateTaskDto, TasksResponse, TaskFilters } from '../models/task.model';
import { ApiResponse } from '../models/api-response.model';

const API_URL = 'http://localhost:5000/api/tasks';

/**
 * Task Service
 * Handles CRUD and filtering API communication for Tasks.
 */
@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);

  constructor() {}

  /**
   * Fetches tasks applying query parameters from filters object
   */
  getTasks(filters?: TaskFilters): Observable<TasksResponse> {
    let params = new HttpParams();

    if (filters) {
      if (filters.projectId) params = params.set('projectId', filters.projectId);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.priority) params = params.set('priority', filters.priority);
      if (filters.search) params = params.set('search', filters.search);
      if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
      if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<TasksResponse>(API_URL, { params });
  }

  /**
   * Creates a new task
   */
  createTask(dto: CreateTaskDto): Observable<ApiResponse<Task>> {
    return this.http.post<ApiResponse<Task>>(API_URL, dto);
  }

  /**
   * Fetches a single task by ID
   */
  getTask(id: string): Observable<ApiResponse<Task>> {
    return this.http.get<ApiResponse<Task>>(`${API_URL}/${id}`);
  }

  /**
   * Updates a task
   */
  updateTask(id: string, dto: Partial<CreateTaskDto>): Observable<ApiResponse<Task>> {
    return this.http.put<ApiResponse<Task>>(`${API_URL}/${id}`, dto);
  }

  /**
   * Deletes a task
   */
  deleteTask(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${API_URL}/${id}`);
  }

  /**
   * Convenience method to update task status (e.g. for Kanban Drag & Drop)
   */
  updateTaskStatus(id: string, status: string): Observable<ApiResponse<Task>> {
    return this.updateTask(id, { status: status as any });
  }
}
