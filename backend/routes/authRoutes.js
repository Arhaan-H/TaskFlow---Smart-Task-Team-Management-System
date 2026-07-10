const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const protect = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator
} = require('../validators/authValidator');

/**
 * Authentication Routes
 * Mounted at /api/auth
 */

// POST /api/auth/register - Register a new user
router.post('/register', registerValidator, validate, authController.register);

// POST /api/auth/login - User login
router.post('/login', loginValidator, validate, authController.login);

// GET /api/auth/profile - Fetch user profile (authenticated)
router.get('/profile', protect, authController.getProfile);

// PUT /api/auth/profile - Update user profile text & upload avatar (authenticated)
router.put('/profile', protect, upload.single('avatar'), updateProfileValidator, validate, authController.updateProfile);

// PUT /api/auth/change-password - Change current user password (authenticated)
router.put('/change-password', protect, changePasswordValidator, validate, authController.changePassword);

module.exports = router;
