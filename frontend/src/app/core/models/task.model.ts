export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in-progress' | 'completed';

/**
 * Task Model Interface
 * Represents a single Task entity in the front-end application.
 * Matches the backend Task schema.
 */
export interface Task {
  _id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  deadline: string; // ISO date string
  status: TaskStatus;
  projectId: { _id: string; title: string } | string; // Populated or ID
  assignedTo?: { _id: string; name: string; email: string; avatar?: string } | string | null;
  createdBy: string; // User ID
  labels: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Data Transfer Object for creating tasks
 */
export interface CreateTaskDto {
  title: string;
  description?: string;
  priority?: TaskPriority;
  deadline?: string;
  status?: TaskStatus;
  projectId: string;
  assignedTo?: string | null;
  labels?: string[];
  notes?: string;
}

/**
 * Paginated API response structure for Task lists
 */
export interface TasksResponse {
  success: boolean;
  data: Task[];
  total: number;
  page: number;
  pages: number;
}

/**
 * Filter parameters for querying tasks
 */
export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
