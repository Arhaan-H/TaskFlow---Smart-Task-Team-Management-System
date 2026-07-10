const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const protect = require('../middleware/auth');

/**
 * Dashboard Routes
 * Mounted at /api/dashboard
 */

router.get('/', protect, dashboardController.getDashboard);

module.exports = router;
