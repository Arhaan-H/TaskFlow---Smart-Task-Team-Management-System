import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { ProjectService } from '../../../core/services/project.service';
import { ToastService } from '../../../core/services/toast.service';
import { Project } from '../../../core/models/project.model';

/**
 * Project Form Dialog Component
 * Handled inside a MatDialog overlay.
 * Handles both project creation and editing.
 */
@Component({
  selector: 'app-project-form',
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
      {{ isEditMode ? 'Edit Project' : 'Create New Project' }}
    </h2>
    
    <form [formGroup]="projectForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content class="space-y-4">
        <!-- Project Title -->
        <mat-form-field appearance="outline">
          <mat-label>Project Title</mat-label>
          <input 
            matInput 
            formControlName="title" 
            placeholder="e.g. Website Overhaul" 
            required 
          />
          <mat-error *ngIf="projectForm.get('title')?.hasError('required')">
            Project title is required.
          </mat-error>
        </mat-form-field>

        <!-- Project Description -->
        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <textarea 
            matInput 
            formControlName="description" 
            placeholder="Describe project deliverables..."
            rows="3"
          ></textarea>
        </mat-form-field>

        <!-- Start & End Datepicker range -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>Start Date</mat-label>
            <input 
              matInput 
              [matDatepicker]="startPicker" 
              formControlName="startDate" 
              placeholder="Choose a date"
            />
            <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>End Date</mat-label>
            <input 
              matInput 
              [matDatepicker]="endPicker" 
              formControlName="endDate" 
              placeholder="Choose a date"
            />
            <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
          </mat-form-field>
        </div>

        <!-- Project Status (only shown in Edit mode) -->
        <mat-form-field appearance="outline" *ngIf="isEditMode">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            <mat-option value="active">Active</mat-option>
            <mat-option value="completed">Completed</mat-option>
            <mat-option value="on-hold">On Hold</mat-option>
          </mat-select>
        </mat-form-field>
      </mat-dialog-content>

      <!-- Action Actions -->
      <mat-dialog-actions align="end" class="gap-2 pb-4 pr-6">
        <button mat-button type="button" mat-dialog-close>Cancel</button>
        <button 
          mat-raised-button 
          color="primary" 
          type="submit" 
          [disabled]="projectForm.invalid || isLoading"
        >
          {{ isEditMode ? 'Save Changes' : 'Create Project' }}
        </button>
      </mat-dialog-actions>
    </form>
  `
})
export class ProjectFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private projectService = inject(ProjectService);
  private toast = inject(ToastService);
  private dialogRef = inject(MatDialogRef<ProjectFormComponent>);
  
  // Injected dialog config
  public data = inject<{ project?: Project }>(MAT_DIALOG_DATA);

  // States
  projectForm!: FormGroup;
  isEditMode = false;
  isLoading = false;

  ngOnInit(): void {
    // 1. Check if we are editing an existing project
    const project = this.data?.project;
    this.isEditMode = !!project;

    // 2. Initialize Reactive Form
    this.projectForm = this.fb.group({
      title: [project?.title || '', [Validators.required, Validators.maxLength(100)]],
      description: [project?.description || '', [Validators.maxLength(500)]],
      startDate: [project?.startDate ? new Date(project.startDate) : null],
      endDate: [project?.endDate ? new Date(project.endDate) : null],
      status: [project?.status || 'active']
    });
  }

  /**
   * Submits form to create or update project
   */
  onSubmit(): void {
    if (this.projectForm.invalid) return;

    this.isLoading = true;
    const formValue = this.projectForm.value;

    // Format dates to ISO strings if chosen
    const payload = {
      ...formValue,
      startDate: formValue.startDate ? formValue.startDate.toISOString() : null,
      endDate: formValue.endDate ? formValue.endDate.toISOString() : null
    };

    if (this.isEditMode && this.data.project) {
      // Update existing project
      this.projectService.updateProject(this.data.project._id, payload).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.toast.success('Project updated successfully.');
          this.dialogRef.close(res.data);
        },
        error: (err) => {
          this.isLoading = false;
          this.toast.error(err.error?.message || 'Failed to update project.');
        }
      });
    } else {
      // Create new project
      this.projectService.createProject(payload).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.toast.success('Project created successfully.');
          this.dialogRef.close(res.data);
        },
        error: (err) => {
          this.isLoading = false;
          this.toast.error(err.error?.message || 'Failed to create project.');
        }
      });
    }
  }
}
