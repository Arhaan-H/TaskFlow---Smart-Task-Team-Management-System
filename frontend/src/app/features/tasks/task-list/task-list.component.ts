import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { TaskService } from '../../../core/services/task.service';
import { ProjectService } from '../../../core/services/project.service';
import { ToastService } from '../../../core/services/toast.service';
import { Task } from '../../../core/models/task.model';
import { Project } from '../../../core/models/project.model';
import { TaskFormComponent } from '../task-form/task-form.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

/**
 * Task List Component
 * Renders the main task board workspace table view.
 * Enables users to search, filter by project, priority, status, and perform CRUD actions.
 */
@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatPaginatorModule, 
    MatButtonModule, 
    MatIconModule, 
    MatSelectModule, 
    MatInputModule
  ],
  template: `
    <div class="space-y-6 fade-in">
      
      <!-- Page Header -->
      <div class="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1>Task Board</h1>
          <p>Manage, prioritize, and allocate tasks across your projects.</p>
        </div>
        <button mat-raised-button color="primary" (click)="openTaskDialog()" class="flex items-center gap-2">
          <mat-icon>add</mat-icon>
          Add Task
        </button>
      </div>

      <!-- Filter Controls Toolbar -->
      <div class="tf-card py-4 px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
        <!-- Search bar -->
        <mat-form-field appearance="outline" class="w-full hide-subscript">
          <mat-label>Search tasks...</mat-label>
          <input 
            matInput 
            #searchInput 
            (keyup)="onSearch(searchInput.value)" 
            placeholder="e.g. Code landing page" 
          />
          <mat-icon matSuffix class="text-slate-400">search</mat-icon>
        </mat-form-field>

        <!-- Project Filter -->
        <mat-form-field appearance="outline" class="w-full hide-subscript">
          <mat-label>Project Filter</mat-label>
          <mat-select #projectSelect (selectionChange)="onFilterProject(projectSelect.value)">
            <mat-option value="">All Projects</mat-option>
            <mat-option *ngFor="let proj of projects()" [value]="proj._id">
              {{ proj.title }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <!-- Priority Filter -->
        <mat-form-field appearance="outline" class="w-full hide-subscript">
          <mat-label>Priority</mat-label>
          <mat-select #prioritySelect (selectionChange)="onFilterPriority(prioritySelect.value)">
            <mat-option value="">All Priorities</mat-option>
            <mat-option value="low">Low</mat-option>
            <mat-option value="medium">Medium</mat-option>
            <mat-option value="high">High</mat-option>
          </mat-select>
        </mat-form-field>

        <!-- Status Filter -->
        <mat-form-field appearance="outline" class="w-full hide-subscript">
          <mat-label>Status</mat-label>
          <mat-select #statusSelect (selectionChange)="onFilterStatus(statusSelect.value)">
            <mat-option value="">All Statuses</mat-option>
            <mat-option value="pending">Pending</mat-option>
            <mat-option value="in-progress">In Progress</mat-option>
            <mat-option value="completed">Completed</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Tasks Table Display -->
      <div class="tf-card p-0 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm" *ngIf="tasks().length > 0; else emptyState">
            <thead>
              <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold bg-slate-50 dark:bg-slate-800/40">
                <th class="py-4 pl-6">Title</th>
                <th class="py-4">Project</th>
                <th class="py-4">Priority</th>
                <th class="py-4">Status</th>
                <th class="py-4">Deadline</th>
                <th class="py-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr 
                *ngFor="let task of tasks()" 
                class="hover:bg-slate-50 dark:hover:bg-slate-800/20"
                [ngClass]="{'overdue-row': isOverdue(task)}"
              >
                <!-- Title -->
                <td class="py-4 pl-6 font-semibold text-slate-800 dark:text-slate-100">
                  {{ task.title }}
                </td>

                <!-- Project -->
                <td class="py-4 text-slate-600 dark:text-slate-300">
                  {{ getProjectTitle(task) }}
                </td>

                <!-- Priority Badge -->
                <td class="py-4">
                  <span 
                    [ngClass]="{
                      'badge-low': task.priority === 'low',
                      'badge-medium': task.priority === 'medium',
                      'badge-high': task.priority === 'high'
                    }"
                  >
                    {{ task.priority | uppercase }}
                  </span>
                </td>

                <!-- Status Badge -->
                <td class="py-4">
                  <span 
                    [ngClass]="{
                      'badge-pending': task.status === 'pending',
                      'badge-in-progress': task.status === 'in-progress',
                      'badge-completed': task.status === 'completed'
                    }"
                  >
                    {{ task.status | uppercase }}
                  </span>
                </td>

                <!-- Deadline -->
                <td class="py-4 text-slate-500 dark:text-slate-400 font-medium">
                  <span [ngClass]="{'text-red-500 font-semibold': isOverdue(task)}">
                    {{ task.deadline ? (task.deadline | date:'MMM d, y') : 'No deadline' }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="py-4 text-right pr-6">
                  <div class="flex justify-end gap-1">
                    <button 
                      mat-icon-button 
                      (click)="openTaskDialog(task)" 
                      title="Edit Task"
                      class="text-slate-400 hover:text-blue-500"
                    >
                      <mat-icon class="text-sm">edit</mat-icon>
                    </button>
                    <button 
                      mat-icon-button 
                      (click)="onDelete(task)" 
                      title="Delete Task"
                      class="text-slate-400 hover:text-red-500"
                    >
                      <mat-icon class="text-sm">delete</mat-icon>
                    </button>
                  </div>
                </td>

              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty state template -->
        <ng-template #emptyState>
          <div class="py-16 text-center text-slate-400">
            <mat-icon class="text-6xl mb-3 opacity-30">playlist_add_check</mat-icon>
            <h2 class="text-lg font-bold text-slate-700 dark:text-slate-200">No Tasks Found</h2>
            <p class="text-sm mt-1 max-w-sm mx-auto">Either you haven't created any tasks yet, or no tasks match your current filter settings.</p>
            <button mat-raised-button color="primary" class="mt-6" (click)="openTaskDialog()">
              Create New Task
            </button>
          </div>
        </ng-template>
      </div>

      <!-- Pagination Footer -->
      <mat-paginator 
        *ngIf="totalCount() > 0"
        [length]="totalCount()"
        [pageSize]="pageSize()"
        [pageIndex]="pageIndex() - 1"
        [pageSizeOptions]="[10, 20, 50]"
        (page)="onPageChange($event)"
        class="bg-transparent text-slate-600 dark:text-slate-400"
      >
      </mat-paginator>

    </div>
  `,
  styles: [`
    ::ng-deep .hide-subscript .mat-mdc-form-field-subscript-wrapper {
      display: none !important;
    }
  `]
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);
  private projectService = inject(ProjectService);
  private toast = inject(ToastService);
  private dialog = inject(MatDialog);

  // States
  tasks = signal<Task[]>([]);
  projects = signal<Project[]>([]);
  totalCount = signal<number>(0);
  pageSize = signal<number>(10);
  pageIndex = signal<number>(1);

  // Active filters
  searchQuery = signal<string>('');
  projectIdFilter = signal<string>('');
  priorityFilter = signal<string>('');
  statusFilter = signal<string>('');

  ngOnInit(): void {
    this.loadProjectsList();
    this.loadTasksList();
  }

  /**
   * Fetches the user's projects to populate the filter dropdown
   */
  loadProjectsList(): void {
    this.projectService.getProjects({ limit: 100 }).subscribe({
      next: (res) => this.projects.set(res.data)
    });
  }

  /**
   * Loads tasks from backend based on active filters
   */
  loadTasksList(): void {
    this.taskService.getTasks({
      page: this.pageIndex(),
      limit: this.pageSize(),
      search: this.searchQuery(),
      projectId: this.projectIdFilter(),
      priority: this.priorityFilter() as any,
      status: this.statusFilter() as any
    }).subscribe({
      next: (res) => {
        this.tasks.set(res.data);
        this.totalCount.set(res.total);
      },
      error: () => this.toast.error('Failed to load task board data.')
    });
  }

  /**
   * Checks if a task is overdue
   */
  isOverdue(task: Task): boolean {
    if (task.status === 'completed' || !task.deadline) return false;
    return new Date(task.deadline) < new Date();
  }

  /**
   * Resolves project title dynamically
   */
  getProjectTitle(task: Task): string {
    if (typeof task.projectId === 'object' && task.projectId !== null) {
      return task.projectId.title;
    }
    return 'Unassigned Project';
  }

  // Filter triggers
  onSearch(val: string): void {
    this.searchQuery.set(val.trim());
    this.pageIndex.set(1);
    this.loadTasksList();
  }

  onFilterProject(id: string): void {
    this.projectIdFilter.set(id);
    this.pageIndex.set(1);
    this.loadTasksList();
  }

  onFilterPriority(prio: string): void {
    this.priorityFilter.set(prio);
    this.pageIndex.set(1);
    this.loadTasksList();
  }

  onFilterStatus(status: string): void {
    this.statusFilter.set(status);
    this.pageIndex.set(1);
    this.loadTasksList();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadTasksList();
  }

  /**
   * Opens Task Dialog overlay
   */
  openTaskDialog(task?: Task): void {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '600px',
      data: { task }
    });

    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        this.loadTasksList();
      }
    });
  }

  /**
   * Deletes task
   */
  onDelete(task: Task): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Task',
        message: `Are you sure you want to delete task "${task.title}"? This action cannot be undone.`
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.taskService.deleteTask(task._id).subscribe({
          next: (res) => {
            this.toast.success(res.message || 'Task deleted successfully.');
            this.loadTasksList();
          },
          error: (err) => {
            this.toast.error(err.error?.message || 'Failed to delete task.');
          }
        });
      }
    });
  }
}
