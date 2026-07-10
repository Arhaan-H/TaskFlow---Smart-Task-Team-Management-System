const { errorResponse } = require('../utils/apiResponse');
const config = require('../config/config');

/**
 * Centralized Error Handling Middleware
 * Catch-all middleware to handle all errors occurred in async handlers.
 * Standardizes API responses for errors.
 */
module.exports = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Log error stack trace in development
  if (config.nodeEnv === 'development') {
    console.error('Error Details:', err);
  }

  // Handle Mongoose Bad ObjectId (Cast Error)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with id of ${err.value}`;
  }

  // Handle Mongoose Duplicate Key Error (e.g. registered email)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate field value entered. The ${field} already exists.`;
    errors = [{ field, message: `This ${field} is already registered.` }];
  }

  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed.';
    errors = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message
    }));
  }

  // Handle JSON Web Token Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Authorization denied.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Session expired. Please log in again.';
  }

  // Return standard error response
  return errorResponse(res, statusCode, message, errors);
};
