const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { generateInsights } = require('../controllers/aiController');

// AI Insights endpoint
router.post('/insights', protect, authorize('analytics'), generateInsights);

module.exports = router;

