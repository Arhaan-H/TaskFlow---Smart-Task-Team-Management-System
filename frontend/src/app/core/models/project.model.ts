export type ProjectStatus = 'active' | 'completed' | 'on-hold';

/**
 * Project Model Interface
 * Represents a single Project entity in the front-end application.
 * Matches the backend Project schema structure.
 */
export interface Project {
  _id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
  createdBy: string; // User ID
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  taskCount?: number; // Calculated dynamically by backend
}

/**
 * Data Transfer Object for creating projects
 */
export interface CreateProjectDto {
  title: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
}

/**
 * Paginated API response structure for Project lists
 */
export interface ProjectsResponse {
  success: boolean;
  data: Project[];
  total: number;
  page: number;
  pages: number;
}
