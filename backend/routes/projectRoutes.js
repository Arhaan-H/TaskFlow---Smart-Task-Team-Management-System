const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const protect = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createProjectValidator, updateProjectValidator } = require('../validators/projectValidator');

/**
 * Project Routes
 * Mounted at /api/projects
 * All routes require authentication (protect middleware)
 */

router.use(protect); // Protect all routes below

// GET /api/projects - Get all projects (paginated)
// POST /api/projects - Create a new project
router.route('/')
  .get(projectController.getProjects)
  .post(createProjectValidator, validate, projectController.createProject);

// GET /api/projects/:id - Get a project by ID
// PUT /api/projects/:id - Update a project by ID
// DELETE /api/projects/:id - Delete a project and tasks by ID
router.route('/:id')
  .get(projectController.getProject)
  .put(updateProjectValidator, validate, projectController.updateProject)
  .delete(projectController.deleteProject);

module.exports = router;
