import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Task } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';
import { ToastService } from '../../../core/services/toast.service';

/**
 * Kanban Component
 * Implements a card-based visual Kanban task board using Angular CDK DragDrop.
 * Distributes tasks into Pending, In Progress, and Completed swimlanes.
 */
@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, DragDropModule, MatIconModule, MatButtonModule],
  template: `
    <!-- Top Swimlanes container -->
    <div class="kanban-board" cdkDropListGroup>
      
      <!-- 1. PENDING COLUMN -->
      <div class="kanban-col flex flex-col">
        <div class="kanban-col-header">
          <span class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            PENDING
          </span>
          <span class="bg-blue-50 dark:bg-slate-700/50 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md text-xs font-bold">
            {{ pendingTasks.length }}
          </span>
        </div>

        <div
          id="pending"
          cdkDropList
          [cdkDropListData]="pendingTasks"
          (cdkDropListDropped)="onDrop($event)"
          class="flex-1 space-y-3 min-h-[350px] py-2"
        >
          <div *ngFor="let task of pendingTasks" cdkDrag [cdkDragData]="task" class="kanban-card">
            <h4 class="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-snug">
              {{ task.title }}
            </h4>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-2" *ngIf="task.description">
              {{ task.description }}
            </p>
            <div class="flex justify-between items-center mt-4">
              <!-- Priority badge -->
              <span 
                [ngClass]="{
                  'badge-low': task.priority === 'low',
                  'badge-medium': task.priority === 'medium',
                  'badge-high': task.priority === 'high'
                }"
              >
                {{ task.priority }}
              </span>
              <!-- Deadline warning -->
              <span class="text-[10px] text-slate-400 font-medium" *ngIf="task.deadline">
                {{ task.deadline | date:'MMM d' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. IN-PROGRESS COLUMN -->
      <div class="kanban-col flex flex-col">
        <div class="kanban-col-header">
          <span class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            IN PROGRESS
          </span>
          <span class="bg-amber-50 dark:bg-slate-700/50 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md text-xs font-bold">
            {{ inProgressTasks.length }}
          </span>
        </div>

        <div
          id="in-progress"
          cdkDropList
          [cdkDropListData]="inProgressTasks"
          (cdkDropListDropped)="onDrop($event)"
          class="flex-1 space-y-3 min-h-[350px] py-2"
        >
          <div *ngFor="let task of inProgressTasks" cdkDrag [cdkDragData]="task" class="kanban-card">
            <h4 class="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-snug">
              {{ task.title }}
            </h4>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-2" *ngIf="task.description">
              {{ task.description }}
            </p>
            <div class="flex justify-between items-center mt-4">
              <span 
                [ngClass]="{
                  'badge-low': task.priority === 'low',
                  'badge-medium': task.priority === 'medium',
                  'badge-high': task.priority === 'high'
                }"
              >
                {{ task.priority }}
              </span>
              <span class="text-[10px] text-slate-400 font-medium" *ngIf="task.deadline">
                {{ task.deadline | date:'MMM d' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. COMPLETED COLUMN -->
      <div class="kanban-col flex flex-col">
        <div class="kanban-col-header">
          <span class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            COMPLETED
          </span>
          <span class="bg-emerald-50 dark:bg-slate-700/50 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md text-xs font-bold">
            {{ completedTasks.length }}
          </span>
        </div>

        <div
          id="completed"
          cdkDropList
          [cdkDropListData]="completedTasks"
          (cdkDropListDropped)="onDrop($event)"
          class="flex-1 space-y-3 min-h-[350px] py-2"
        >
          <div *ngFor="let task of completedTasks" cdkDrag [cdkDragData]="task" class="kanban-card opacity-75">
            <h4 class="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-snug line-through">
              {{ task.title }}
            </h4>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-2" *ngIf="task.description">
              {{ task.description }}
            </p>
            <div class="flex justify-between items-center mt-4">
              <span 
                [ngClass]="{
                  'badge-low': task.priority === 'low',
                  'badge-medium': task.priority === 'medium',
                  'badge-high': task.priority === 'high'
                }"
              >
                {{ task.priority }}
              </span>
              <span class="text-[10px] text-slate-400 font-medium" *ngIf="task.deadline">
                {{ task.deadline | date:'MMM d' }}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class KanbanComponent implements OnChanges {
  private taskService = inject(TaskService);
  private toast = inject(ToastService);

  // Inputs
  @Input() tasks: Task[] = [];
  @Input() projectId: string = '';

  // Outputs
  @Output() taskMoved = new EventEmitter<void>();

  // Swimlane task arrays
  pendingTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  completedTasks: Task[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tasks']) {
      this.distributeTasks();
    }
  }

  /**
   * Distributes lists of tasks into their respective status columns
   */
  private distributeTasks(): void {
    this.pendingTasks = this.tasks.filter(t => t.status === 'pending');
    this.inProgressTasks = this.tasks.filter(t => t.status === 'in-progress');
    this.completedTasks = this.tasks.filter(t => t.status === 'completed');
  }

  /**
   * Drop list drop event handler
   */
  onDrop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      // Reordered within the same lane
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Transferred to a different lane
      const task = event.item.data as Task;
      const targetLane = event.container.id; // 'pending' | 'in-progress' | 'completed'

      // Update locally immediately for smooth UI transition
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Perform backend update
      this.taskService.updateTaskStatus(task._id, targetLane).subscribe({
        next: () => {
          this.toast.success(`Task status updated to ${targetLane}.`);
          this.taskMoved.emit();
        },
        error: (err) => {
          this.toast.error('Failed to update task status.');
          // Re-sync on failure
          this.distributeTasks();
        }
      });
    }
  }
}
