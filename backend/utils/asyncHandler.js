// ============================================================
// FILE: backend/utils/asyncHandler.js
// PURPOSE: Wrapper to eliminate repetitive try/catch blocks
// ============================================================
// Problem: Every async route handler needs a try/catch block to
// catch Promise rejections and pass them to Express's error handler.
//
// Without asyncHandler, every controller looks like this:
//   router.get('/', async (req, res, next) => {
//     try {
//       // actual logic
//     } catch (err) {
//       next(err); // ← you must write this every time!
//     }
//   });
//
// With asyncHandler, you write:
//   router.get('/', asyncHandler(async (req, res) => {
//     // actual logic — errors are caught automatically!
//   }));
//
// This keeps controller code clean and DRY (Don't Repeat Yourself).
// ============================================================

/**
 * asyncHandler - Higher-order function (a function that returns a function)
 *
 * @param {Function} fn - An async route handler function
 * @returns {Function}  - A new function that wraps fn in try/catch
 *
 * How it works:
 *   1. We return a new Express-compatible middleware function (req, res, next)
 *   2. Inside, we call fn(req, res, next) and attach .catch(next)
 *   3. If fn throws or rejects, .catch(next) forwards the error to Express
 *      which then hands it to our centralized errorHandler middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  // Promise.resolve() wraps the function call so even synchronous
  // throws are caught by .catch()
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Export as default — import it like: const asyncHandler = require('../utils/asyncHandler')
module.exports = asyncHandler;
