import { Component, OnInit, inject, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Chart } from 'chart.js/auto';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DashboardService } from '../../core/services/dashboard.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { StatsCardComponent } from '../../shared/components/stats-card/stats-card.component';
import { DashboardStats, AnalyticsData } from '../../core/models/api-response.model';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';
import { ToastService } from '../../core/services/toast.service';

/**
 * Dashboard Component
 * Renders main overview dashboard containing key KPI metric summary cards,
 * graphical analytics charts (Pie, Bar, Line) and tracking lists.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink,
    MatIconModule, 
    MatButtonModule,
    StatsCardComponent, 
    TimeAgoPipe
  ],
  template: `
    <div class="space-y-6 fade-in">
      
      <!-- Page Header -->
      <div class="page-header flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Real-time analytics, upcoming deadlines, and team activity summary.</p>
        </div>
        <div class="flex items-center gap-3">
          <button mat-raised-button color="primary" routerLink="/projects" class="flex items-center gap-2">
            <mat-icon>add</mat-icon>
            New Project
          </button>
        </div>
      </div>

      <!-- Stats Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" *ngIf="stats()">
        <app-stats-card 
          title="Total Projects" 
          [value]="stats()!.totalProjects" 
          icon="folder" 
          color="#3b82f6" 
        />
        <app-stats-card 
          title="Total Tasks" 
          [value]="stats()!.totalTasks" 
          icon="assignment" 
          color="#6366f1" 
        />
        <app-stats-card 
          title="Completed Tasks" 
          [value]="stats()!.completedTasks" 
          icon="check_circle" 
          color="#10b981" 
          [subtitle]="stats()!.totalTasks ? ((stats()!.completedTasks / stats()!.totalTasks) * 100 | number:'1.0-0') + '% completion' : '0%'"
        />
        <app-stats-card 
          title="Overdue Tasks" 
          [value]="stats()!.overdueTasks" 
          icon="error" 
          color="#ef4444" 
        />
      </div>

      <!-- Charts Analytics Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Pie Chart (Status) -->
        <div class="tf-card flex flex-col">
          <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
            <mat-icon class="text-slate-400">pie_chart</mat-icon>
            Tasks by Status
          </h3>
          <div class="flex-1 flex items-center justify-center relative min-h-[220px]">
            <canvas #statusChartCanvas></canvas>
            <div *ngIf="noData()" class="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
              No task data available.
            </div>
          </div>
        </div>

        <!-- Bar Chart (Tasks per Project) -->
        <div class="tf-card lg:col-span-2 flex flex-col">
          <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
            <mat-icon class="text-slate-400">bar_chart</mat-icon>
            Workload per Project
          </h3>
          <div class="flex-1 flex items-center justify-center relative min-h-[220px]">
            <canvas #projectChartCanvas></canvas>
            <div *ngIf="noData()" class="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
              No project tasks available.
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Grid: Recent Activity & Deadlines -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Upcoming Deadlines -->
        <div class="tf-card">
          <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center justify-between">
            <span class="flex items-center gap-2">
              <mat-icon class="text-red-500">alarm</mat-icon>
              Upcoming Deadlines
            </span>
            <span class="badge-high" *ngIf="stats()?.overdueTasks">
              {{ stats()?.overdueTasks }} Overdue
            </span>
          </h3>

          <!-- Table of Deadlines -->
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm" *ngIf="stats()?.upcomingDeadlines?.length; else emptyDeadlines">
              <thead>
                <tr class="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                  <th class="pb-3">Task</th>
                  <th class="pb-3">Project</th>
                  <th class="pb-3">Deadline</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-850">
                <tr *ngFor="let item of stats()?.upcomingDeadlines" class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td class="py-3 font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                    {{ item.title }}
                  </td>
                  <td class="py-3 text-slate-500 dark:text-slate-400">
                    {{ item.projectId?.title || 'Unknown' }}
                  </td>
                  <td class="py-3 font-medium text-red-500">
                    {{ item.deadline | date:'MMM d, y' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <ng-template #emptyDeadlines>
            <div class="py-8 text-center text-slate-400 text-sm">
              <mat-icon class="text-4xl mb-2 opacity-30">check_circle</mat-icon>
              <p>Excellent! No upcoming deadlines pending.</p>
            </div>
          </ng-template>
        </div>

        <!-- Recent Activity Feed -->
        <div class="tf-card">
          <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
            <mat-icon class="text-slate-400">history</mat-icon>
            Recent Activities
          </h3>

          <div class="space-y-4" *ngIf="stats()?.recentActivities?.length; else emptyActivities">
            <div 
              *ngFor="let activity of stats()?.recentActivities" 
              class="flex items-start gap-3 text-sm pb-4 border-b border-slate-100 dark:border-slate-850 last:border-0 last:pb-0"
            >
              <div 
                class="w-8 h-8 rounded-full flex items-center justify-center text-white"
                [style.background-color]="activity.status === 'completed' ? '#10b981' : '#3b82f6'"
              >
                <mat-icon class="text-base">
                  {{ activity.status === 'completed' ? 'check' : 'edit' }}
                </mat-icon>
              </div>
              <div class="flex-1">
                <p class="text-slate-700 dark:text-slate-200">
                  Task <strong>{{ activity.title }}</strong> updated to 
                  <span 
                    [ngClass]="{
                      'text-emerald-500 font-semibold': activity.status === 'completed',
                      'text-amber-500 font-semibold': activity.status === 'in-progress',
                      'text-indigo-500 font-semibold': activity.status === 'pending'
                    }"
                  >
                    {{ activity.status }}
                  </span>
                </p>
                <span class="text-xs text-slate-400 mt-1 block">
                  {{ activity.updatedAt | timeAgo }}
                </span>
              </div>
            </div>
          </div>
          
          <ng-template #emptyActivities>
            <div class="py-8 text-center text-slate-400 text-sm">
              <mat-icon class="text-4xl mb-2 opacity-30">history</mat-icon>
              <p>No activity logs recorded yet.</p>
            </div>
          </ng-template>
        </div>

      </div>

    </div>
  `
})
export class DashboardComponent implements OnInit, AfterViewInit {
  private dashboardService = inject(DashboardService);
  private analyticsService = inject(AnalyticsService);
  private toast = inject(ToastService);

  // References to Chart Canvases
  @ViewChild('statusChartCanvas') statusChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('projectChartCanvas') projectChartCanvas!: ElementRef<HTMLCanvasElement>;

  // Data signals
  stats = signal<DashboardStats | null>(null);
  analytics = signal<AnalyticsData | null>(null);
  noData = signal<boolean>(false);

  // Chart instances
  statusChart: any;
  projectChart: any;

  ngOnInit(): void {
    // 1. Fetch KPI metrics from dashboard service
    this.dashboardService.getDashboard().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.stats.set(res.data);
        }
      },
      error: () => this.toast.error('Failed to load dashboard metrics.')
    });
  }

  ngAfterViewInit(): void {
    // 2. Load chart datasets from analytics service
    this.analyticsService.getAnalytics().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.analytics.set(res.data);
          
          // Verify if there are tasks recorded
          const hasTasks = res.data.tasksByStatus.length > 0;
          this.noData.set(!hasTasks);

          if (hasTasks) {
            // Render charts
            this.renderCharts(res.data);
          }
        }
      },
      error: () => this.toast.error('Failed to render analytics charts.')
    });
  }

  /**
   * Initializes and renders Chart.js charts
   */
  private renderCharts(data: AnalyticsData): void {
    // Prepare tasks by status (Pie Chart)
    const statusLabels = data.tasksByStatus.map(s => s._id);
    const statusCounts = data.tasksByStatus.map(s => s.count);
    const statusColors = statusLabels.map(label => {
      if (label === 'completed') return '#10b981'; // success
      if (label === 'in-progress') return '#f59e0b'; // warning
      return '#3b82f6'; // info/pending
    });

    if (this.statusChartCanvas) {
      this.statusChart = new Chart(this.statusChartCanvas.nativeElement, {
        type: 'pie',
        data: {
          labels: statusLabels.map(l => l.toUpperCase()),
          datasets: [{
            data: statusCounts,
            backgroundColor: statusColors,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                padding: 15,
                font: { family: 'Inter', size: 11 }
              }
            }
          }
        }
      });
    }

    // Prepare tasks per project (Bar Chart)
    const projectLabels = data.tasksByProject.map(p => p.projectTitle);
    const projectCounts = data.tasksByProject.map(p => p.count);

    if (this.projectChartCanvas) {
      this.projectChart = new Chart(this.projectChartCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: projectLabels,
          datasets: [{
            label: 'Active Tasks',
            data: projectCounts,
            backgroundColor: '#6366f1',
            borderRadius: 6,
            maxBarThickness: 40
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1 }
            }
          }
        }
      });
    }
  }
}
