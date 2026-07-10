// ============================================================
// FILE: backend/models/Task.js
// PURPOSE: Mongoose schema & model for the Task collection
// ============================================================
// Tasks are the core work items in TaskFlow. Each task belongs
// to a Project and can be assigned to a User. Tasks support
// priority levels, status tracking, deadlines, labels, and notes.
// ============================================================

const mongoose = require('mongoose');

// ── Schema Definition ─────────────────────────────────────────
const taskSchema = new mongoose.Schema(
  {
    // Short, descriptive name for the task (e.g. "Design login page")
    title: {
      type:      String,
      required:  [true, 'Task title is required'],
      trim:      true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    // Optional detailed description of what needs to be done
    description: {
      type:    String,
      trim:    true,
      default: '',
    },

    // How urgent/important this task is
    priority: {
      type:    String,
      enum: {
        values:  ['low', 'medium', 'high'],
        message: 'Priority must be one of: low, medium, high',
      },
      default: 'medium',
    },

    // Optional target completion date for this specific task
    deadline: {
      type: Date,
    },

    // Current workflow state of the task
    status: {
      type:    String,
      enum: {
        values:  ['pending', 'in-progress', 'completed'],
        message: 'Status must be one of: pending, in-progress, completed',
      },
      default: 'pending',
    },

    // Reference to the Project this task belongs to
    // A task MUST belong to a project
    projectId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Project',
      required: [true, 'Task must belong to a project'],
    },

    // Reference to the User who is responsible for completing this task
    // Optional — a task might not be assigned to anyone yet
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
    },

    // Reference to the User who created/added this task
    createdBy: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Task must have a creator'],
    },

    // Array of string labels/tags for categorization (e.g. ['bug', 'frontend'])
    // [] means it defaults to an empty array
    labels: {
      type:    [String],
      default: [],
    },

    // Free-form text field for extra notes or context about the task
    notes: {
      type:    String,
      default: '',
    },
  },
  {
    // timestamps: true gives us `createdAt` and `updatedAt` automatically
    // `updatedAt` is especially useful — we use it to find "recent activity"
    timestamps: true,
  }
);

// ── Indexes ────────────────────────────────────────────────────
// Indexes speed up common queries dramatically on large datasets

// Most common query: "get all tasks for project X"
taskSchema.index({ projectId: 1 });

// Filter tasks by who created them
taskSchema.index({ createdBy: 1 });

// Filter by status — used in dashboard counts and analytics
taskSchema.index({ status: 1 });

// Compound index for the most complex dashboard query:
// "Find overdue tasks created by user X"
taskSchema.index({ createdBy: 1, deadline: 1, status: 1 });

// ── Model Creation ─────────────────────────────────────────────
const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
