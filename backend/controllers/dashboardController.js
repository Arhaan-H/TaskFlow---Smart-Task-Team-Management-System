const Project = require('../models/Project');
const Task = require('../models/Task');
const { successResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Dashboard Controller
 * Aggregates statistics for the user's dashboard view.
 */

// @desc    Get dashboard summary statistics
// @route   GET /api/dashboard
// @access  Private
exports.getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 1. Get total projects
  const totalProjects = await Project.countDocuments({ createdBy: userId });

  // Find user's project IDs for task filtering
  const projects = await Project.find({ createdBy: userId }).select('_id');
  const projectIds = projects.map(p => p._id);

  // Define task query base
  const taskQuery = { projectId: { $in: projectIds } };

  // 2. Task metrics
  const totalTasks = await Task.countDocuments(taskQuery);
  const completedTasks = await Task.countDocuments({ ...taskQuery, status: 'completed' });
  const pendingTasks = await Task.countDocuments({ ...taskQuery, status: 'pending' });
  const inProgressTasks = await Task.countDocuments({ ...taskQuery, status: 'in-progress' });

  // 3. Overdue Tasks (Deadline in the past AND status is not completed)
  const now = new Date();
  const overdueTasks = await Task.countDocuments({
    ...taskQuery,
    status: { $ne: 'completed' },
    deadline: { $lt: now }
  });

  // 4. Today's Tasks (Deadline is today)
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const todayTasks = await Task.countDocuments({
    ...taskQuery,
    deadline: { $gte: startOfToday, $lte: endOfToday }
  });

  // 5. High Priority Tasks (Priority is high AND status is not completed)
  const highPriorityTasks = await Task.countDocuments({
    ...taskQuery,
    priority: 'high',
    status: { $ne: 'completed' }
  });

  // 6. Recent Activity (last 5 updated tasks)
  const recentActivities = await Task.find(taskQuery)
    .populate('projectId', 'title')
    .sort({ updatedAt: -1 })
    .limit(5)
    .lean();

  // 7. Upcoming Deadlines (next 5 tasks with future deadlines, sorted by closest)
  const upcomingDeadlines = await Task.find({
    ...taskQuery,
    status: { $ne: 'completed' },
    deadline: { $gte: now }
  })
    .populate('projectId', 'title')
    .sort({ deadline: 1 })
    .limit(5)
    .lean();

  // Compile summary
  const dashboardStats = {
    totalProjects,
    totalTasks,
    completedTasks,
    pendingTasks,
    inProgressTasks,
    overdueTasks,
    todayTasks,
    highPriorityTasks,
    recentActivities,
    upcomingDeadlines
  };

  return successResponse(res, 200, 'Dashboard statistics loaded successfully.', dashboardStats);
});
