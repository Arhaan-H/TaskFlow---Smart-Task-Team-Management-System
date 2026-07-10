import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProjectService } from '../../../core/services/project.service';
import { TaskService } from '../../../core/services/task.service';
import { ToastService } from '../../../core/services/toast.service';
import { Project } from '../../../core/models/project.model';
import { Task } from '../../../core/models/task.model';
import { KanbanComponent } from '../../tasks/kanban/kanban.component';
import { TaskFormComponent } from '../../tasks/task-form/task-form.component';

/**
 * Project Detail Component
 * Renders the detail page for a specific project.
 * Uses tabs to toggle between a tabular Task List and a CDK DragDrop Kanban Board.
 */
@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink,
    MatTabsModule, 
    MatButtonModule, 
    MatIconModule,
    MatDialogModule,
    KanbanComponent
  ],
  template: `
    <div class="space-y-6 fade-in" *ngIf="project()">
      
      <!-- Back navigation & Actions row -->
      <div class="flex items-center justify-between">
        <button mat-button routerLink="/projects" class="flex items-center gap-1 text-slate-500 hover:text-slate-700">
          <mat-icon class="text-sm">arrow_back</mat-icon>
          Back to Workspace
        </button>

        <button mat-raised-button color="primary" (click)="openTaskDialog()" class="flex items-center gap-2">
          <mat-icon>add</mat-icon>
          Add Task
        </button>
      </div>

      <!-- Project details banner -->
      <div class="tf-card bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-950 text-white border-0 py-8 px-6 md:px-8 shadow-xl">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <!-- Status Badge -->
            <span 
              class="text-xs font-bold tracking-wider px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase"
            >
              {{ project()!.status }}
            </span>
            <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight mt-2 text-white">
              {{ project()!.title }}
            </h1>
            <p class="text-slate-300 text-sm mt-2 max-w-2xl">
              {{ project()!.description || 'No description provided for this project.' }}
            </p>
          </div>

          <!-- Date ranges -->
          <div class="text-slate-400 text-sm bg-slate-800/40 p-4 rounded-xl border border-slate-700/30 md:text-right" *ngIf="project()!.startDate">
            <span class="text-xs block text-slate-500 font-bold uppercase tracking-wider">Project Timeline</span>
            <span class="text-slate-200 font-semibold block mt-1">
              {{ project()!.startDate | date:'MMM d, y' }}
            </span>
            <span class="text-xs text-slate-500 block my-0.5">through</span>
            <span class="text-slate-200 font-semibold block">
              {{ project()!.endDate | date:'MMM d, y' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Tab View: Tasks List vs Kanban Board -->
      <div class="tf-card p-4">
        <mat-tab-group (selectedTabChange)="onTabChange($event.index)">
          
          <!-- Tab 1: Kanban Board View -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="mr-2">view_week</mat-icon>
              Kanban Board
            </ng-template>
            <div class="pt-6">
              <app-kanban 
                [tasks]="tasks()" 
                [projectId]="projectId"
                (taskMoved)="onTaskMoved()"
              />
            </div>
          </mat-tab>

          <!-- Tab 2: Task List Details -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="mr-2">format_list_bulleted</mat-icon>
              Task List Details
            </ng-template>
            <div class="pt-6">
              
              <!-- Quick Tasks Table -->
              <div class="overflow-x-auto">
                <table class="w-full text-left text-sm" *ngIf="tasks().length > 0; else emptyTasks">
                  <thead>
                    <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                      <th class="pb-3 pl-2">Title</th>
                      <th class="pb-3">Priority</th>
                      <th class="pb-3">Status</th>
                      <th class="pb-3">Deadline</th>
                      <th class="pb-3 text-right pr-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr *ngFor="let task of tasks()" class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <!-- Title -->
                      <td class="py-4 pl-2 font-semibold text-slate-800 dark:text-slate-100">
                        {{ task.title }}
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

                      <!-- Deadline Date -->
                      <td class="py-4 text-slate-500 dark:text-slate-400">
                        {{ task.deadline ? (task.deadline | date:'MMM d, y') : 'No deadline' }}
                      </td>

                      <!-- Action Buttons -->
                      <td class="py-4 text-right pr-2">
                        <div class="flex justify-end gap-1">
                          <button mat-icon-button class="text-slate-400 hover:text-blue-500" (click)="openTaskDialog(task)">
                            <mat-icon class="text-base">edit</mat-icon>
                          </button>
                          <button mat-icon-button class="text-slate-400 hover:text-red-500" (click)="onDeleteTask(task)">
                            <mat-icon class="text-base">delete</mat-icon>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Empty state tasks -->
              <ng-template #emptyTasks>
                <div class="py-12 text-center text-slate-400">
                  <mat-icon class="text-5xl mb-2 opacity-30">playlist_add</mat-icon>
                  <h3 class="font-bold text-slate-700 dark:text-slate-200">No Tasks Created</h3>
                  <p class="text-sm">Create a task to build your project sprint workload.</p>
                  <button mat-stroked-button color="primary" class="mt-4" (click)="openTaskDialog()">
                    Add First Task
                  </button>
                </div>
              </ng-template>

            </div>
          </mat-tab>

        </mat-tab-group>
      </div>

    </div>
  `
})
export class ProjectDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private projectService = inject(ProjectService);
  private taskService = inject(TaskService);
  private toast = inject(ToastService);
  private dialog = inject(MatDialog);

  // States
  projectId: string = '';
  project = signal<Project | null>(null);
  tasks = signal<Task[]>([]);

  ngOnInit(): void {
    // 1. Fetch Project ID from URL route parameters
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    
    if (this.projectId) {
      this.loadProjectDetails();
      this.loadProjectTasks();
    }
  }

  /**
   * Fetches core project details
   */
  loadProjectDetails(): void {
    this.projectService.getProject(this.projectId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.project.set(res.data);
        }
      },
      error: () => this.toast.error('Failed to load project details.')
    });
  }

  /**
   * Fetches tasks associated with this project (all of them, page/limit unlimited)
   */
  loadProjectTasks(): void {
    this.taskService.getTasks({
      projectId: this.projectId,
      limit: 100 // Load all tasks for Kanban drag drop
    }).subscribe({
      next: (res) => {
        this.tasks.set(res.data);
      },
      error: () => this.toast.error('Failed to load project tasks.')
    });
  }

  /**
   * Handles tab change trigger
   */
  onTabChange(index: number): void {
    // If switching back to task lists or kanban, refresh task data
    this.loadProjectTasks();
  }

  /**
   * Triggered when drag and drop updates status on the server
   */
  onTaskMoved(): void {
    this.loadProjectTasks();
  }

  /**
   * Opens Task Dialog overlay
   */
  openTaskDialog(task?: Task): void {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '600px',
      data: {
        task,
        projectId: this.projectId // Pre-fills project selection
      }
    });

    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        this.loadProjectTasks();
      }
    });
  }

  /**
   * Triggers single task deletion
   */
  onDeleteTask(task: Task): void {
    this.taskService.deleteTask(task._id).subscribe({
      next: (res) => {
        this.toast.success(res.message || 'Task deleted successfully.');
        this.loadProjectTasks();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to delete task.');
      }
    });
  }
}
