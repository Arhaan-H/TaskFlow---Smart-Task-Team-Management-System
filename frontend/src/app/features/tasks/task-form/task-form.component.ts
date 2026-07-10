import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { TaskService } from '../../../core/services/task.service';
import { ProjectService } from '../../../core/services/project.service';
import { ToastService } from '../../../core/services/toast.service';
import { Task } from '../../../core/models/task.model';
import { Project } from '../../../core/models/project.model';

/**
 * Task Form Dialog Component
 * Handled inside a MatDialog overlay.
 * Supports task creation and editing.
 */
@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title class="font-bold text-slate-800 dark:text-slate-100">
      {{ isEditMode ? 'Edit Task Details' : 'Add New Task' }}
    </h2>

    <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content class="space-y-4">
        
        <!-- Task Title -->
        <mat-form-field appearance="outline">
          <mat-label>Task Title</mat-label>
          <input 
            matInput 
            formControlName="title" 
            placeholder="e.g. Design Landing Page UI" 
            required 
          />
          <mat-error *ngIf="taskForm.get('title')?.hasError('required')">
            Task title is required.
          </mat-error>
        </mat-form-field>

        <!-- Project Selection (disabled if pre-filled from detail page) -->
        <mat-form-field appearance="outline">
          <mat-label>Associated Project</mat-label>
          <mat-select formControlName="projectId" required>
            <mat-option *ngFor="let proj of projects" [value]="proj._id">
              {{ proj.title }}
            </mat-option>
          </mat-select>
          <mat-error *ngIf="taskForm.get('projectId')?.hasError('required')">
            Please link this task to a project.
          </mat-error>
        </mat-form-field>

        <!-- Task Description -->
        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <textarea 
            matInput 
            formControlName="description" 
            placeholder="Outline task deliverables..." 
            rows="2"
          ></textarea>
        </mat-form-field>

        <!-- Dynamic properties (Priority & Status) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>Priority</mat-label>
            <mat-select formControlName="priority">
              <mat-option value="low">Low</mat-option>
              <mat-option value="medium">Medium</mat-option>
              <mat-option value="high">High</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option value="pending">Pending</mat-option>
              <mat-option value="in-progress">In Progress</mat-option>
              <mat-option value="completed">Completed</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <!-- Deadline & Labels -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>Deadline Date</mat-label>
            <input 
              matInput 
              [matDatepicker]="deadlinePicker" 
              formControlName="deadline" 
              placeholder="Choose date"
            />
            <mat-datepicker-toggle matSuffix [for]="deadlinePicker"></mat-datepicker-toggle>
            <mat-datepicker #deadlinePicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Labels (comma separated)</mat-label>
            <input 
              matInput 
              formControlName="labelsInput" 
              placeholder="e.g. frontend, bug, UI" 
            />
            <mat-hint>Separate items with commas</mat-hint>
          </mat-form-field>
        </div>

        <!-- Notes -->
        <mat-form-field appearance="outline">
          <mat-label>Additional Notes</mat-label>
          <textarea 
            matInput 
            formControlName="notes" 
            placeholder="Add notes, links or reminders..." 
            rows="2"
          ></textarea>
        </mat-form-field>

      </mat-dialog-content>

      <!-- Action Footer -->
      <mat-dialog-actions align="end" class="gap-2 pb-4 pr-6">
        <button mat-button type="button" mat-dialog-close>Cancel</button>
        <button 
          mat-raised-button 
          color="primary" 
          type="submit" 
          [disabled]="taskForm.invalid || isLoading"
        >
          {{ isEditMode ? 'Save Details' : 'Add Task' }}
        </button>
      </mat-dialog-actions>
    </form>
  `
})
export class TaskFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private projectService = inject(ProjectService);
  private toast = inject(ToastService);
  private dialogRef = inject(MatDialogRef<TaskFormComponent>);

  // Injected dialog configuration
  public data = inject<{ task?: Task; projectId?: string }>(MAT_DIALOG_DATA);

  // States
  taskForm!: FormGroup;
  projects: Project[] = [];
  isEditMode = false;
  isLoading = false;

  ngOnInit(): void {
    // 1. Check if we are editing an existing task
    const task = this.data?.task;
    this.isEditMode = !!task;

    // 2. Load projects lists to populate the dropdown
    this.projectService.getProjects({ limit: 100 }).subscribe({
      next: (res) => this.projects = res.data
    });

    // 3. Resolve project ID (check if passed from project detail page)
    const activeProjectId = task ? (typeof task.projectId === 'object' ? task.projectId._id : task.projectId) : (this.data?.projectId || '');

    // Resolve comma-separated labels string from array
    const labelsString = task?.labels ? task.labels.join(', ') : '';

    // 4. Initialize Reactive Form
    this.taskForm = this.fb.group({
      title: [task?.title || '', [Validators.required, Validators.maxLength(100)]],
      description: [task?.description || '', [Validators.maxLength(1000)]],
      priority: [task?.priority || 'medium'],
      status: [task?.status || 'pending'],
      deadline: [task?.deadline ? new Date(task.deadline) : null],
      projectId: [activeProjectId, [Validators.required]],
      labelsInput: [labelsString],
      notes: [task?.notes || '', [Validators.maxLength(500)]]
    });
  }

  /**
   * Submits details to create or edit task
   */
  onSubmit(): void {
    if (this.taskForm.invalid) return;

    this.isLoading = true;
    const formValue = this.taskForm.value;

    // Format comma-separated labels input to array
    const labels = formValue.labelsInput
      ? formValue.labelsInput.split(',').map((l: string) => l.trim()).filter((l: string) => l.length > 0)
      : [];

    const payload = {
      title: formValue.title,
      description: formValue.description,
      priority: formValue.priority,
      status: formValue.status,
      deadline: formValue.deadline ? formValue.deadline.toISOString() : null,
      projectId: formValue.projectId,
      labels,
      notes: formValue.notes
    };

    if (this.isEditMode && this.data.task) {
      // Update Task
      this.taskService.updateTask(this.data.task._id, payload).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.toast.success('Task details updated.');
          this.dialogRef.close(res.data);
        },
        error: (err) => {
          this.isLoading = false;
          this.toast.error(err.error?.message || 'Failed to update task.');
        }
      });
    } else {
      // Create Task
      this.taskService.createTask(payload).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.toast.success('Task created successfully.');
          this.dialogRef.close(res.data);
        },
        error: (err) => {
          this.isLoading = false;
          this.toast.error(err.error?.message || 'Failed to create task.');
        }
      });
    }
  }
}
