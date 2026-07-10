const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Request Validation Middleware
 * Checks the validation results of express-validator schema checks.
 * If validation fails, it formats the error messages and returns a 422 Unprocessable Entity response.
 * Otherwise, it proceeds to the next middleware or controller.
 */
module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Extract formatted error messages
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));

    return errorResponse(
      res, 
      422, 
      'Validation failed. Please correct the highlighted errors.', 
      formattedErrors
    );
  }
  next();
};
