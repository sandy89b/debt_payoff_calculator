const express = require('express');
const router = express.Router();
const Debt = require('../models/Debt');
const FrameworkStep = require('../models/FrameworkStep');
const Devotional = require('../models/Devotional');
const User = require('../models/User');

// =============================================
// DEBT MANAGEMENT ROUTES
// =============================================

// Get all debts for a user
router.get('/debts', async (req, res) => {
  try {
    const userId = req.user.id; // Assuming auth middleware sets req.user
    const debts = await Debt.findByUserId(userId);
    res.json({ success: true, data: debts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create a new debt
router.post('/debts', async (req, res) => {
  try {
    const userId = req.user.id;
    const debtData = req.body;
    
    // Validate required fields
    const { name, balance, interestRate, minimumPayment, dueDate } = debtData;
    if (!name || !balance || !interestRate || !minimumPayment || !dueDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: name, balance, interestRate, minimumPayment, dueDate' 
      });
    }
    
    const debt = await Debt.create(userId, debtData);
    res.status(201).json({ success: true, data: debt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update a debt
router.put('/debts/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const debtId = req.params.id;
    const updateData = req.body;
    
    const debt = await Debt.update(debtId, userId, updateData);
    res.json({ success: true, data: debt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete a debt
router.delete('/debts/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const debtId = req.params.id;
    
    const debt = await Debt.delete(debtId, userId);
    res.json({ success: true, data: debt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get debt statistics
router.get('/debts/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await Debt.getDebtStats(userId);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Calculate payoff scenarios
router.post('/debts/calculate-payoff', async (req, res) => {
  try {
    const userId = req.user.id;
    const { extraPayment = 0 } = req.body;
    
    const scenarios = await Debt.calculatePayoffScenarios(userId, extraPayment);
    res.json({ success: true, data: scenarios });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// FRAMEWORK STEPS ROUTES
// =============================================

// Get all framework steps
router.get('/framework/steps', async (req, res) => {
  try {
    const steps = await FrameworkStep.findAll();
    res.json({ success: true, data: steps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's framework progress
router.get('/framework/progress', async (req, res) => {
  try {
    const userId = req.user.id;
    const progress = await FrameworkStep.getUserProgress(userId);
    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update framework step progress
router.put('/framework/steps/:stepId/progress', async (req, res) => {
  try {
    const userId = req.user.id;
    const stepId = req.params.stepId;
    const progressData = req.body;
    
    const progress = await FrameworkStep.updateUserProgress(userId, stepId, progressData);
    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get current framework step
router.get('/framework/current-step', async (req, res) => {
  try {
    const userId = req.user.id;
    const currentStep = await FrameworkStep.getCurrentStep(userId);
    res.json({ success: true, data: currentStep });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get framework completion statistics
router.get('/framework/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await FrameworkStep.getCompletionStats(userId);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// DEVOTIONALS ROUTES
// =============================================

// Get all published devotionals
router.get('/devotionals', async (req, res) => {
  try {
    const { limit = 50, offset = 0, category } = req.query;
    
    let devotionals;
    if (category) {
      devotionals = await Devotional.findByCategory(category, parseInt(limit), parseInt(offset));
    } else {
      devotionals = await Devotional.findPublished(parseInt(limit), parseInt(offset));
    }
    
    res.json({ success: true, data: devotionals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get today's devotional
router.get('/devotionals/today', async (req, res) => {
  try {
    const devotional = await Devotional.getTodaysDevotional();
    res.json({ success: true, data: devotional });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get a specific devotional
router.get('/devotionals/:id', async (req, res) => {
  try {
    const devotionalId = req.params.id;
    const devotional = await Devotional.findById(devotionalId);
    
    if (!devotional) {
      return res.status(404).json({ success: false, message: 'Devotional not found' });
    }
    
    res.json({ success: true, data: devotional });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's devotional progress
router.get('/devotionals/progress', async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;
    
    const progress = await Devotional.getUserProgress(userId, parseInt(limit), parseInt(offset));
    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark devotional as read
router.post('/devotionals/:id/read', async (req, res) => {
  try {
    const userId = req.user.id;
    const devotionalId = req.params.id;
    const { readingTimeSeconds, rating, notes } = req.body;
    
    const progress = await Devotional.markAsRead(userId, devotionalId, readingTimeSeconds, rating, notes);
    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Toggle favorite status
router.post('/devotionals/:id/favorite', async (req, res) => {
  try {
    const userId = req.user.id;
    const devotionalId = req.params.id;
    
    const isFavorite = await Devotional.toggleFavorite(userId, devotionalId);
    res.json({ success: true, data: { isFavorite } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's favorite devotionals
router.get('/devotionals/favorites', async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;
    
    const favorites = await Devotional.getUserFavorites(userId, parseInt(limit), parseInt(offset));
    res.json({ success: true, data: favorites });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get devotional reading statistics
router.get('/devotionals/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await Devotional.getReadingStats(userId);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get available categories
router.get('/devotionals/categories', async (req, res) => {
  try {
    const categories = await Devotional.getCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// DASHBOARD ROUTES
// =============================================

// Get dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all dashboard data in parallel
    const [debtStats, frameworkStats, devotionalStats, currentStep] = await Promise.all([
      Debt.getDebtStats(userId),
      FrameworkStep.getCompletionStats(userId),
      Devotional.getReadingStats(userId),
      FrameworkStep.getCurrentStep(userId)
    ]);
    
    const dashboardData = {
      debtStats,
      frameworkStats,
      devotionalStats,
      currentStep,
      lastUpdated: new Date()
    };
    
    res.json({ success: true, data: dashboardData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// USER SETTINGS ROUTES
// =============================================

// Get user settings
router.get('/settings', async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      data: {
        themePreference: user.themePreference,
        onboardingCompleted: user.onboardingCompleted,
        currentFrameworkStep: user.currentFrameworkStep
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user settings
router.put('/settings', async (req, res) => {
  try {
    const userId = req.user.id;
    const { themePreference, onboardingCompleted, currentFrameworkStep } = req.body;
    
    const updateData = {};
    if (themePreference) updateData.themePreference = themePreference;
    if (onboardingCompleted !== undefined) updateData.onboardingCompleted = onboardingCompleted;
    if (currentFrameworkStep) updateData.currentFrameworkStep = currentFrameworkStep;
    
    const user = await User.update(userId, updateData);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

