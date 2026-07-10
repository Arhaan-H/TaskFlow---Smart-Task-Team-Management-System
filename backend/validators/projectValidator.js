const { body } = require('express-validator');

/**
 * Project Validators
 * Validates request input for creating and updating projects.
 */

const createProjectValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Project title is required.')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters.'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters.'),

  body('status')
    .optional()
    .trim()
    .isIn(['active', 'completed', 'on-hold'])
    .withMessage('Status must be either active, completed, or on-hold.'),

  body('startDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Start date must be a valid date (YYYY-MM-DD).'),

  body('endDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('End date must be a valid date (YYYY-MM-DD).')
    .custom((value, { req }) => {
      if (req.body.startDate && new Date(value) < new Date(req.body.startDate)) {
        throw new Error('End date cannot be earlier than start date.');
      }
      return true;
    })
];

const updateProjectValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Project title cannot be empty.')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters.'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters.'),

  body('status')
    .optional()
    .trim()
    .isIn(['active', 'completed', 'on-hold'])
    .withMessage('Status must be either active, completed, or on-hold.'),

  body('startDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Start date must be a valid date (YYYY-MM-DD).'),

  body('endDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('End date must be a valid date (YYYY-MM-DD).')
    .custom((value, { req }) => {
      const start = req.body.startDate;
      if (start && new Date(value) < new Date(start)) {
        throw new Error('End date cannot be earlier than start date.');
      }
      return true;
    })
];

module.exports = {
  createProjectValidator,
  updateProjectValidator
};
