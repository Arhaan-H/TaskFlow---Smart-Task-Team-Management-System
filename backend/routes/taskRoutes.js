const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const protect = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createTaskValidator, updateTaskValidator } = require('../validators/taskValidator');

/**
 * Task Routes
 * Mounted at /api/tasks
 * All routes require authentication
 */

router.use(protect); // Protect all routes below

// GET /api/tasks - Get all tasks (filtered & sorted)
// POST /api/tasks - Create a new task
router.route('/')
  .get(taskController.getTasks)
  .post(createTaskValidator, validate, taskController.createTask);

// GET /api/tasks/:id - Get a task by ID
// PUT /api/tasks/:id - Update a task by ID
// DELETE /api/tasks/:id - Delete a task by ID
router.route('/:id')
  .get(taskController.getTask)
  .put(updateTaskValidator, validate, taskController.updateTask)
  .delete(taskController.deleteTask);

module.exports = router;
