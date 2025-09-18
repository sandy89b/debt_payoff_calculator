const express = require('express');
const EmailAutomationController = require('../controllers/emailAutomationController');

const router = express.Router();

// Email Templates
router.get('/templates', EmailAutomationController.getTemplates);
router.get('/templates/:id', EmailAutomationController.getTemplate);
router.post('/templates', EmailAutomationController.createTemplate);
router.put('/templates/:id', EmailAutomationController.updateTemplate);
router.delete('/templates/:id', EmailAutomationController.deleteTemplate);

// Email Campaigns
router.get('/campaigns', EmailAutomationController.getCampaigns);
router.get('/campaigns/:id', EmailAutomationController.getCampaign);
router.post('/campaigns', EmailAutomationController.createCampaign);
router.put('/campaigns/:id', EmailAutomationController.updateCampaign);

// Email Operations
router.post('/send-test', EmailAutomationController.sendTestEmail);
router.get('/analytics', EmailAutomationController.getAnalytics);
router.get('/sends', EmailAutomationController.getEmailSends);

// Initialization
router.post('/initialize-defaults', EmailAutomationController.initializeDefaults);

module.exports = router;
