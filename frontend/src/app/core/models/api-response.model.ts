/**
 * General API Response Interface
 * Wraps all single object or list responses from our backend.
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
}

/**
 * Dashboard Statistics Interface
 * Returned by GET /api/dashboard
 */
export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  todayTasks: number;
  highPriorityTasks: number;
  recentActivities: any[];
  upcomingDeadlines: any[];
}

/**
 * Analytics Data Interface (for Chart.js rendering)
 * Returned by GET /api/analytics
 */
export interface AnalyticsData {
  tasksByStatus: { _id: string; count: number }[];
  tasksByPriority: { _id: string; count: number }[];
  tasksByProject: { _id: string; projectTitle: string; count: number }[];
  weeklyProductivity: { date: string; count: number }[];
  monthlyProductivity: { date: string; count: number }[];
  completionRate: number;
}
