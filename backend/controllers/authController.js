const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const fs = require('fs');
const path = require('path');

/**
 * Auth Controller
 * Handles user registration, login, profile management, and password changes.
 */

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // 1. Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return errorResponse(res, 400, 'User with this email already exists.');
  }

  // 2. Create user (password will be hashed by pre-save hook in User model)
  const user = await User.create({
    name,
    email,
    password
  });

  // 3. Generate token & response
  const token = generateToken(user._id);
  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    createdAt: user.createdAt
  };

  return successResponse(res, 201, 'User registered successfully.', {
    token,
    user: userData
  });
});

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return errorResponse(res, 401, 'Invalid email or password.');
  }

  // 2. Compare passwords
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return errorResponse(res, 401, 'Invalid email or password.');
  }

  // 3. Generate token & response
  const token = generateToken(user._id);
  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    createdAt: user.createdAt
  };

  return successResponse(res, 200, 'Login successful.', {
    token,
    user: userData
  });
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res) => {
  // req.user is already populated by auth middleware (password excluded)
  return successResponse(res, 200, 'Profile retrieved successfully.', req.user);
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return errorResponse(res, 404, 'User not found.');
  }

  // Update text fields
  if (req.body.name) user.name = req.body.name;
  
  if (req.body.email && req.body.email !== user.email) {
    // Check if new email is taken
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) {
      return errorResponse(res, 400, 'This email address is already in use.');
    }
    user.email = req.body.email;
  }

  // Update avatar file if uploaded
  if (req.file) {
    // Delete old avatar if it exists and is a file
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, '../', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        try {
          fs.unlinkSync(oldAvatarPath);
        } catch (err) {
          console.error('Error deleting old avatar:', err);
        }
      }
    }
    // Store relative path (uploads/avatar-xyz.jpg)
    user.avatar = `uploads/${req.file.filename}`;
  }

  const updatedUser = await user.save();

  const responseData = {
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    avatar: updatedUser.avatar,
    createdAt: updatedUser.createdAt
  };

  return successResponse(res, 200, 'Profile updated successfully.', responseData);
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    return errorResponse(res, 404, 'User not found.');
  }

  // 1. Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return errorResponse(res, 400, 'Invalid current password.');
  }

  // 2. Set new password (pre-save hook will hash it)
  user.password = newPassword;
  await user.save();

  return successResponse(res, 200, 'Password changed successfully.');
});
