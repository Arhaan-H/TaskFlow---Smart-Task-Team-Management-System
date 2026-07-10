const Project = require('../models/Project');
const Task = require('../models/Task');
const { successResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const mongoose = require('mongoose');

/**
 * Analytics Controller
 * Aggregates analytical data (groups, counts, trends) for charts.
 */

// @desc    Get analytics statistics for charts
// @route   GET /api/analytics
// @access  Private
exports.getAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Find user's projects to filter tasks
  const projects = await Project.find({ createdBy: userId }).select('_id');
  const projectIds = projects.map(p => p._id);

  if (projectIds.length === 0) {
    // Return empty stats if user has no projects yet
    return successResponse(res, 200, 'Analytics retrieved successfully.', {
      tasksByStatus: [],
      tasksByPriority: [],
      tasksByProject: [],
      weeklyProductivity: [],
      monthlyProductivity: [],
      completionRate: 0
    });
  }

  // 1. Tasks by Status (for Pie Chart)
  const tasksByStatus = await Task.aggregate([
    { $match: { projectId: { $in: projectIds } } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // 2. Tasks by Priority (for Doughnut Chart)
  const tasksByPriority = await Task.aggregate([
    { $match: { projectId: { $in: projectIds } } },
    { $group: { _id: '$priority', count: { $sum: 1 } } }
  ]);

  // 3. Tasks by Project (for Bar Chart)
  const tasksByProject = await Task.aggregate([
    { $match: { projectId: { $in: projectIds } } },
    {
      $group: {
        _id: '$projectId',
        count: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'projects', // database collection name (plural lowercase)
        localField: '_id',
        foreignField: '_id',
        as: 'projectDetails'
      }
    },
    { $unwind: '$projectDetails' },
    {
      $project: {
        _id: 1,
        projectTitle: '$projectDetails.title',
        count: 1
      }
    }
  ]);

  // 4. Productivity trends (Tasks Completed in last 7 days vs last 30 days)
  const getProductivityData = async (days) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const productivity = await Task.aggregate([
      {
        $match: {
          projectId: { $in: projectIds },
          status: 'completed',
          updatedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in missing dates to make a continuous chart line
    const dateMap = {};
    productivity.forEach(item => {
      dateMap[item._id] = item.count;
    });

    const result = [];
    for (let i = days; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      result.push({
        date: dateString,
        count: dateMap[dateString] || 0
      });
    }
    return result;
  };

  const weeklyProductivity = await getProductivityData(7);
  const monthlyProductivity = await getProductivityData(30);

  // 5. Completion Rate Percentage
  const totalTasks = await Task.countDocuments({ projectId: { $in: projectIds } });
  const completedTasks = await Task.countDocuments({ projectId: { $in: projectIds }, status: 'completed' });
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const analyticsData = {
    tasksByStatus,
    tasksByPriority,
    tasksByProject,
    weeklyProductivity,
    monthlyProductivity,
    completionRate
  };

  return successResponse(res, 200, 'Analytics retrieved successfully.', analyticsData);
});
