const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');
const { errorResponse } = require('../utils/apiResponse');

/**
 * JWT Authentication Middleware
 * This middleware intercepts requests to protected routes, checks for a valid
 * JSON Web Token (JWT) in the Authorization header, verifies it, and attaches
 * the authenticated user's database object to the request object (req.user).
 */
module.exports = async (req, res, next) => {
  try {
    // 1. Get token from authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 401, 'Token expired. Please login again.');
      }
      return errorResponse(res, 401, 'Invalid token.');
    }

    // 3. Find user from database
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return errorResponse(res, 401, 'User associated with this token no longer exists.');
    }

    // 4. Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
