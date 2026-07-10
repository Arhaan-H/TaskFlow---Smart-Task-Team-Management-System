const Task = require('../models/Task');
const Project = require('../models/Project');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Task Controller
 * Handles CRUD operations for Tasks.
 * Tasks belong to projects, which in turn belong to users.
 */

// @desc    Get all tasks for the user (with filtering, searching, and sorting)
// @route   GET /api/tasks
// @access  Private
exports.getTasks = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { projectId, status, priority, search, sortBy, sortOrder, page, limit } = req.query;

  const currentPage = parseInt(page, 10) || 1;
  const currentLimit = parseInt(limit, 10) || 10;
  const skip = (currentPage - 1) * currentLimit;

  // Build filter query
  const query = { createdBy: userId };

  // Project filter
  if (projectId) {
    query.projectId = projectId;
  } else {
    // If no project specified, find all projects owned by user first
    const projects = await Project.find({ createdBy: userId }).select('_id');
    const projectIds = projects.map(p => p._id);
    query.projectId = { $in: projectIds };
  }

  // Status filter
  if (status) {
    query.status = status;
  }

  // Priority filter
  if (priority) {
    query.priority = priority;
  }

  // Search filter
  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  // Build sort options
  const sort = {};
  if (sortBy) {
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  } else {
    sort.createdAt = -1; // Default sort by newest
  }

  // Get total count
  const total = await Task.countDocuments(query);

  // Fetch tasks
  const tasks = await Task.find(query)
    .populate('projectId', 'title status')
    .populate('assignedTo', 'name email avatar')
    .sort(sort)
    .skip(skip)
    .limit(currentLimit);

  return res.status(200).json({
    success: true,
    data: tasks,
    total,
    page: currentPage,
    pages: Math.ceil(total / currentLimit)
  });
});

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = asyncHandler(async (req, res) => {
  const { title, description, priority, deadline, status, projectId, assignedTo, labels, notes } = req.body;

  // 1. Verify project exists and belongs to current user
  const project = await Project.findOne({ _id: projectId, createdBy: req.user._id });
  if (!project) {
    return errorResponse(res, 404, 'Associated Project not found or unauthorized.');
  }

  // 2. Create task
  const task = await Task.create({
    title,
    description,
    priority: priority || 'medium',
    status: status || 'pending',
    deadline,
    projectId,
    assignedTo: assignedTo || null,
    createdBy: req.user._id,
    labels: labels || [],
    notes: notes || ''
  });

  const populatedTask = await Task.findById(task._id)
    .populate('projectId', 'title status')
    .populate('assignedTo', 'name email avatar');

  return successResponse(res, 201, 'Task created successfully.', populatedTask);
});

// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    createdBy: req.user._id
  })
    .populate('projectId', 'title status')
    .populate('assignedTo', 'name email avatar');

  if (!task) {
    return errorResponse(res, 404, 'Task not found or unauthorized.');
  }

  return successResponse(res, 200, 'Task retrieved successfully.', task);
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = asyncHandler(async (req, res) => {
  const { title, description, priority, deadline, status, projectId, assignedTo, labels, notes } = req.body;

  const task = await Task.findOne({
    _id: req.params.id,
    createdBy: req.user._id
  });

  if (!task) {
    return errorResponse(res, 404, 'Task not found or unauthorized.');
  }

  // Check if changing projects, verify ownership of new project
  if (projectId && projectId !== task.projectId.toString()) {
    const project = await Project.findOne({ _id: projectId, createdBy: req.user._id });
    if (!project) {
      return errorResponse(res, 404, 'New associated Project not found or unauthorized.');
    }
    task.projectId = projectId;
  }

  // Update fields
  if (title) task.title = title;
  if (description !== undefined) task.description = description;
  if (priority) task.priority = priority;
  if (deadline !== undefined) task.deadline = deadline;
  if (status) task.status = status;
  if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
  if (labels !== undefined) task.labels = labels;
  if (notes !== undefined) task.notes = notes;

  await task.save();

  const populatedTask = await Task.findById(task._id)
    .populate('projectId', 'title status')
    .populate('assignedTo', 'name email avatar');

  return successResponse(res, 200, 'Task updated successfully.', populatedTask);
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    createdBy: req.user._id
  });

  if (!task) {
    return errorResponse(res, 404, 'Task not found or unauthorized.');
  }

  await Task.deleteOne({ _id: task._id });

  return successResponse(res, 200, 'Task deleted successfully.');
});
