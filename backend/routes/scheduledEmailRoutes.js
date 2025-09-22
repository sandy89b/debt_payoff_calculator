const express = require('express');
const scheduledEmailService = require('../services/scheduledEmailService');
const { verifyAdmin } = require('../middleware/adminAuth');

const router = express.Router();

// Apply admin authentication to all routes
router.use(verifyAdmin);

// Get status of all scheduled jobs
router.get('/status', (req, res) => {
  try {
    const status = scheduledEmailService.getStatus();
    res.json({
      success: true,
      data: {
        jobs: status,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Manually trigger inactive user check
router.post('/trigger/inactivity-check', async (req, res) => {
  try {
    const result = await scheduledEmailService.triggerInactivityCheck();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Manually trigger weekly check-ins
router.post('/trigger/weekly-checkins', async (req, res) => {
  try {
    const result = await scheduledEmailService.triggerWeeklyCheckIns();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Manually trigger monthly reports
router.post('/trigger/monthly-reports', async (req, res) => {
  try {
    const result = await scheduledEmailService.triggerMonthlyReports();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
