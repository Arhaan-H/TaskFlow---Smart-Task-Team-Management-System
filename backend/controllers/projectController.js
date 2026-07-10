const Project = require('../models/Project');
const Task = require('../models/Task');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Project Controller
 * Handles CRUD operations for Projects.
 * Projects are isolated per user (a user can only access/edit their own projects).
 */

// @desc    Get all projects for authenticated user
// @route   GET /api/projects
// @access  Private
exports.getProjects = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const search = req.query.search || '';
  const status = req.query.status || '';
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Build query
  const query = { createdBy: userId };

  // Search filter (matches title case-insensitive)
  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  // Status filter
  if (status) {
    query.status = status;
  }

  // Get total count for pagination
  const totalCount = await Project.countDocuments(query);

  // Fetch projects
  const projects = await Project.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean(); // Lean for performance

  // Attach taskCount to each project dynamically
  const projectsWithCounts = await Promise.all(
    projects.map(async (project) => {
      const taskCount = await Task.countDocuments({ projectId: project._id });
      return {
        ...project,
        taskCount
      };
    })
  );

  return res.status(200).json({
    success: true,
    data: projectsWithCounts,
    total: totalCount,
    page,
    pages: Math.ceil(totalCount / limit)
  });
});

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
exports.createProject = asyncHandler(async (req, res) => {
  const { title, description, status, startDate, endDate } = req.body;

  const project = await Project.create({
    title,
    description,
    status: status || 'active',
    startDate,
    endDate,
    createdBy: req.user._id
  });

  return successResponse(res, 201, 'Project created successfully.', project);
});

// @desc    Get a single project by ID
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    createdBy: req.user._id
  });

  if (!project) {
    return errorResponse(res, 404, 'Project not found or unauthorized access.');
  }

  return successResponse(res, 200, 'Project retrieved successfully.', project);
});

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = asyncHandler(async (req, res) => {
  const { title, description, status, startDate, endDate } = req.body;

  const project = await Project.findOne({
    _id: req.params.id,
    createdBy: req.user._id
  });

  if (!project) {
    return errorResponse(res, 404, 'Project not found or unauthorized access.');
  }

  // Update fields
  if (title) project.title = title;
  if (description !== undefined) project.description = description;
  if (status) project.status = status;
  if (startDate !== undefined) project.startDate = startDate;
  if (endDate !== undefined) project.endDate = endDate;

  await project.save();

  return successResponse(res, 200, 'Project updated successfully.', project);
});

// @desc    Delete a project and all its associated tasks
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    createdBy: req.user._id
  });

  if (!project) {
    return errorResponse(res, 404, 'Project not found or unauthorized access.');
  }

  // Cascade delete tasks inside this project
  await Task.deleteMany({ projectId: project._id });

  // Delete project
  await Project.deleteOne({ _id: project._id });

  return successResponse(res, 200, 'Project and all its associated tasks deleted successfully.');
});
