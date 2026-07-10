const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const protect = require('../middleware/auth');

/**
 * Analytics Routes
 * Mounted at /api/analytics
 */

router.get('/', protect, analyticsController.getAnalytics);

module.exports = router;
