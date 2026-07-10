import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { ProjectService } from '../../../core/services/project.service';
import { ToastService } from '../../../core/services/toast.service';
import { Project } from '../../../core/models/project.model';
import { ProjectFormComponent } from '../project-form/project-form.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

/**
 * Project List Component
 * Renders grid view of all projects owned by the user.
 * Supports keyword search, status filtering, creation, updates, and cascading deletions.
 */
@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink,
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
          <h1>My Projects</h1>
          <p>Organize, review, and configure workspace projects.</p>
        </div>
        <button mat-raised-button color="primary" (click)="openProjectDialog()" class="flex items-center gap-2">
          <mat-icon>add</mat-icon>
          Create Project
        </button>
      </div>

      <!-- Filters Toolbar -->
      <div class="tf-card py-4 px-6 flex flex-col md:flex-row items-stretch md:items-center gap-4">
        <!-- Search input -->
        <div class="flex-1">
          <mat-form-field appearance="outline" class="w-full hide-subscript">
            <mat-label>Search projects...</mat-label>
            <input 
              matInput 
              #searchInput 
              (keyup)="onSearch(searchInput.value)" 
              placeholder="e.g. Website Overhaul" 
            />
            <mat-icon matSuffix class="text-slate-400">search</mat-icon>
          </mat-form-field>
        </div>

        <!-- Status filter select -->
        <div class="w-full md:w-48">
          <mat-form-field appearance="outline" class="w-full hide-subscript">
            <mat-label>Status</mat-label>
            <mat-select #statusSelect (selectionChange)="onFilterStatus(statusSelect.value)">
              <mat-option value="">All Statuses</mat-option>
              <mat-option value="active">Active</mat-option>
              <mat-option value="completed">Completed</mat-option>
              <mat-option value="on-hold">On Hold</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <!-- Projects Grid Display -->
      <div *ngIf="projects().length > 0; else emptyState" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let project of projects()" class="tf-card flex flex-col justify-between">
          
          <!-- Card Header & Description -->
          <div>
            <div class="flex justify-between items-start mb-3">
              <!-- Status Badge -->
              <span 
                [ngClass]="{
                  'badge-active': project.status === 'active',
                  'badge-completed': project.status === 'completed',
                  'badge-on-hold': project.status === 'on-hold'
                }"
              >
                {{ project.status | uppercase }}
              </span>
              
              <!-- Task Count Badge -->
              <span class="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <mat-icon class="text-xs">assignment</mat-icon>
                {{ project.taskCount || 0 }} tasks
              </span>
            </div>

            <!-- Title link -->
            <a [routerLink]="['/projects', project._id]" class="block group">
              <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-500 transition-colors truncate">
                {{ project.title }}
              </h3>
            </a>
            
            <p class="text-slate-500 dark:text-slate-400 text-sm mt-2 line-clamp-3 min-h-[60px]">
              {{ project.description || 'No description provided.' }}
            </p>
          </div>

          <!-- Dates and Action Triggers -->
          <div class="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              <span *ngIf="project.startDate">
                {{ project.startDate | date:'d MMM' }} - {{ project.endDate | date:'d MMM y' }}
              </span>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center gap-1">
              <button 
                mat-icon-button 
                (click)="openProjectDialog(project)" 
                title="Edit Project"
                class="text-slate-400 hover:text-blue-500"
              >
                <mat-icon class="text-sm">edit</mat-icon>
              </button>
              <button 
                mat-icon-button 
                (click)="onDelete(project)" 
                title="Delete Project"
                class="text-slate-400 hover:text-red-500"
              >
                <mat-icon class="text-sm">delete</mat-icon>
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- Empty State -->
      <ng-template #emptyState>
        <div class="tf-card py-16 text-center text-slate-400">
          <mat-icon class="text-6xl mb-3 opacity-30">folder_open</mat-icon>
          <h2 class="text-lg font-bold text-slate-700 dark:text-slate-200">No Projects Found</h2>
          <p class="text-sm mt-1 max-w-sm mx-auto">Get started by creating your first workspace project to begin grouping team tasks.</p>
          <button mat-raised-button color="primary" class="mt-6" (click)="openProjectDialog()">
            Create New Project
          </button>
        </div>
      </ng-template>

      <!-- Pagination Footer -->
      <mat-paginator 
        *ngIf="totalCount() > 0"
        [length]="totalCount()"
        [pageSize]="pageSize()"
        [pageIndex]="pageIndex() - 1"
        [pageSizeOptions]="[6, 12, 24]"
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
export class ProjectListComponent implements OnInit {
  private projectService = inject(ProjectService);
  private toast = inject(ToastService);
  private dialog = inject(MatDialog);

  // States
  projects = signal<Project[]>([]);
  totalCount = signal<number>(0);
  pageSize = signal<number>(6);
  pageIndex = signal<number>(1);
  searchQuery = signal<string>('');
  statusFilter = signal<string>('');

  ngOnInit(): void {
    this.loadProjects();
  }

  /**
   * Loads projects from service applying active filters
   */
  loadProjects(): void {
    this.projectService.getProjects({
      search: this.searchQuery(),
      status: this.statusFilter(),
      page: this.pageIndex(),
      limit: this.pageSize()
    }).subscribe({
      next: (res) => {
        this.projects.set(res.data);
        this.totalCount.set(res.total);
      },
      error: () => this.toast.error('Failed to load projects list.')
    });
  }

  /**
   * Search input trigger with simple debounce logic
   */
  onSearch(value: string): void {
    this.searchQuery.set(value.trim());
    this.pageIndex.set(1); // Reset to first page
    this.loadProjects();
  }

  /**
   * Status filter selection change
   */
  onFilterStatus(status: string): void {
    this.statusFilter.set(status);
    this.pageIndex.set(1);
    this.loadProjects();
  }

  /**
   * Page details change
   */
  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadProjects();
  }

  /**
   * Opens MatDialog to create or edit a project
   */
  openProjectDialog(project?: Project): void {
    const dialogRef = this.dialog.open(ProjectFormComponent, {
      width: '500px',
      data: { project }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Reload list to pick up modifications
        this.loadProjects();
      }
    });
  }

  /**
   * Triggers cascade deletion of a project
   */
  onDelete(project: Project): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Project',
        message: `Are you sure you want to delete project "${project.title}"? This will delete all tasks inside this project. This action cannot be undone.`
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.projectService.deleteProject(project._id).subscribe({
          next: (res) => {
            this.toast.success(res.message || 'Project deleted successfully.');
            this.loadProjects();
          },
          error: (err) => {
            this.toast.error(err.error?.message || 'Failed to delete project.');
          }
        });
      }
    });
  }
}
