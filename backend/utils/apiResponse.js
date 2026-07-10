// ============================================================
// FILE: backend/utils/apiResponse.js
// PURPOSE: Standardised API response format for all endpoints
// ============================================================
// Consistency is crucial for a good API. Instead of every
// controller building its own JSON structure, we centralise
// the format here. This means the Angular frontend always
// knows exactly what shape to expect.
//
// Success responses always look like:
// {
//   "success": true,
//   "message": "Human readable message",
//   "data": { ... }       ← the actual payload
// }
//
// Error responses always look like:
// {
//   "success": false,
//   "message": "What went wrong",
//   "errors": [ ... ]     ← optional array of field-level errors
// }
// ============================================================

/**
 * successResponse - Sends a standardised success JSON response
 *
 * @param {Object} res        - Express response object
 * @param {number} statusCode - HTTP status code (200, 201, etc.)
 * @param {string} message    - Human-readable success message
 * @param {*}      data       - The payload to return (object, array, etc.)
 *
 * Usage example in a controller:
 *   return successResponse(res, 200, 'Tasks fetched successfully', { tasks });
 */
const successResponse = (res, statusCode = 200, message = 'Success', data = null) => {
  // Build the response body
  const responseBody = {
    success: true,
    message,
  };

  // Only include the `data` key if there is actual data to return
  // This keeps responses clean (no `"data": null` clutter)
  if (data !== null && data !== undefined) {
    responseBody.data = data;
  }

  // res.status() sets the HTTP status code
  // .json() serialises the object to JSON and sends it
  return res.status(statusCode).json(responseBody);
};

/**
 * errorResponse - Sends a standardised error JSON response
 *
 * @param {Object}   res        - Express response object
 * @param {number}   statusCode - HTTP error code (400, 401, 404, 500, etc.)
 * @param {string}   message    - Human-readable error message
 * @param {Array}    errors     - Optional array of detailed error objects
 *                               (used for validation errors)
 *
 * Usage example in a controller:
 *   return errorResponse(res, 404, 'Task not found');
 *   return errorResponse(res, 422, 'Validation failed', validationErrors);
 */
const errorResponse = (res, statusCode = 500, message = 'Internal Server Error', errors = []) => {
  const responseBody = {
    success: false,
    message,
  };

  // Only include the `errors` array if there are actual errors to show
  if (errors && errors.length > 0) {
    responseBody.errors = errors;
  }

  return res.status(statusCode).json(responseBody);
};

// Export both functions individually
module.exports = { successResponse, errorResponse };
