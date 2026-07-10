// ============================================================
// FILE: backend/models/Project.js
// PURPOSE: Mongoose schema & model for the Project collection
// ============================================================
// A Project is the top-level organisational unit in TaskFlow.
// Each project belongs to a user (createdBy) and can contain
// many Tasks. The relationship is:
//   User → has many → Projects → have many → Tasks
// ============================================================

const mongoose = require('mongoose');

// ── Schema Definition ─────────────────────────────────────────
const projectSchema = new mongoose.Schema(
  {
    // The project's display name (e.g. "Website Redesign")
    title: {
      type:     String,
      required: [true, 'Project title is required'],
      trim:     true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    // A longer explanation of what the project is about (optional)
    description: {
      type:    String,
      trim:    true,
      default: '',
    },

    // Current state of the project
    // enum restricts values to only these three options
    status: {
      type:    String,
      enum:    {
        values:  ['active', 'completed', 'on-hold'],
        message: 'Status must be one of: active, completed, on-hold',
      },
      default: 'active', // New projects start as active
    },

    // Optional: when the project work is planned to begin
    startDate: {
      type: Date,
    },

    // Optional: the project's due date / target completion date
    endDate: {
      type: Date,
    },

    // Reference to the User who created this project
    // ObjectId is MongoDB's unique identifier type
    // 'ref: User' tells Mongoose which collection to look up
    // when we call .populate('createdBy')
    createdBy: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Project must belong to a user'],
    },
  },
  {
    // timestamps: true automatically adds:
    //   createdAt — the moment the document was first created
    //   updatedAt — the moment the document was last changed
    // Mongoose updates `updatedAt` on every save() call automatically.
    timestamps: true,
  }
);

// ── Index ──────────────────────────────────────────────────────
// Adding a compound index on (createdBy, status) speeds up queries
// where we filter "get all active projects for user X"
projectSchema.index({ createdBy: 1, status: 1 });

// ── Model Creation ─────────────────────────────────────────────
const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
