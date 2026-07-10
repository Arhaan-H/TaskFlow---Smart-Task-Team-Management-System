const { body } = require('express-validator');

/**
 * Task Validators
 * Validates request input for creating and updating tasks.
 */

const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required.')
    .isLength({ max: 100 })
    .withMessage('Task title cannot exceed 100 characters.'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters.'),

  body('priority')
    .optional()
    .trim()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high.'),

  body('status')
    .optional()
    .trim()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be pending, in-progress, or completed.'),

  body('deadline')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Deadline must be a valid date (YYYY-MM-DD).'),

  body('projectId')
    .trim()
    .notEmpty()
    .withMessage('Project ID is required.')
    .isMongoId()
    .withMessage('Invalid Project ID format.'),

  body('assignedTo')
    .optional({ checkFalsy: true })
    .trim()
    .isMongoId()
    .withMessage('Invalid User ID format for assignee.'),

  body('labels')
    .optional()
    .isArray()
    .withMessage('Labels must be an array of strings.'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters.')
];

const updateTaskValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Task title cannot be empty.'),

  body('description')
    .optional()
    .trim(),

  body('priority')
    .optional()
    .trim()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high.'),

  body('status')
    .optional()
    .trim()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be pending, in-progress, or completed.'),

  body('deadline')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Deadline must be a valid date.'),

  body('projectId')
    .optional()
    .trim()
    .isMongoId()
    .withMessage('Invalid Project ID format.'),

  body('assignedTo')
    .optional({ checkFalsy: true })
    .trim()
    .isMongoId()
    .withMessage('Invalid User ID format for assignee.'),

  body('labels')
    .optional()
    .isArray()
    .withMessage('Labels must be an array of strings.'),

  body('notes')
    .optional()
    .trim()
];

module.exports = {
  createTaskValidator,
  updateTaskValidator
};
