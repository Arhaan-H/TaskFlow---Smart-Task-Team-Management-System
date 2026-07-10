const { body } = require('express-validator');

/**
 * Authentication Validators
 * Defines validations for auth endpoints (register, login, profile updates, password change).
 */

const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters.'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'),

  body('confirmPassword')
    .trim()
    .notEmpty()
    .withMessage('Confirm password is required.')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match.');
      }
      return true;
    })
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .normalizeEmail(),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required.')
];

const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty if provided.')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters.'),

  body('email')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Email cannot be empty if provided.')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail()
];

const changePasswordValidator = [
  body('currentPassword')
    .trim()
    .notEmpty()
    .withMessage('Current password is required.'),

  body('newPassword')
    .trim()
    .notEmpty()
    .withMessage('New password is required.')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password.');
      }
      return true;
    })
];

module.exports = {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator
};
