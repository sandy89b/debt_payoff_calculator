const express = require('express');
const router = express.Router();
const EnhancedDebt = require('../models/EnhancedDebt');
const emailAutomationService = require('../services/emailAutomationService');
const userActivityService = require('../services/userActivityService');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

// Apply authentication to all routes
router.use(authenticateToken);

// =============================================
// ENHANCED DEBT MANAGEMENT ROUTES
// =============================================

// Get all debts for a user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const includeInactive = req.query.includeInactive === 'true';
    
    const debts = await EnhancedDebt.findByUserId(userId, includeInactive);
    
    logger.info('Debts retrieved successfully', { userId, debtCount: debts.length });
    
    res.json({ 
      success: true, 
      data: debts.map(debt => debt.toJSON())
    });
  } catch (error) {
    logger.error('Error retrieving debts', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve debts',
      error: error.message 
    });
  }
});

// Get debt statistics for a user
router.get('/statistics', async (req, res) => {
  try {
    const userId = req.user.id;
    const statistics = await EnhancedDebt.getStatistics(userId);
    
    logger.info('Debt statistics retrieved successfully', { userId });
    
    res.json({ 
      success: true, 
      data: statistics 
    });
  } catch (error) {
    logger.error('Error retrieving debt statistics', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve debt statistics',
      error: error.message 
    });
  }
});

// Get a specific debt by ID
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const debtId = req.params.id;
    
    const debt = await EnhancedDebt.findById(debtId, userId);
    
    if (!debt) {
      return res.status(404).json({ 
        success: false, 
        message: 'Debt not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: debt.toJSON() 
    });
  } catch (error) {
    logger.error('Error retrieving debt', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve debt',
      error: error.message 
    });
  }
});

// Create a new debt
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const debtData = req.body;
    
    // Validate required fields
    const { name, balance, interestRate, minimumPayment, dueDate, debtType } = debtData;
    
    if (!name || balance === undefined || interestRate === undefined || 
        minimumPayment === undefined || !dueDate || !debtType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields',
        errors: [{
          field: 'required',
          message: 'Name, balance, interest rate, minimum payment, due date, and debt type are required'
        }]
      });
    }

    // Additional validation
    if (balance <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: [{
          field: 'balance',
          message: 'Balance must be greater than 0'
        }]
      });
    }

    if (minimumPayment <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: [{
          field: 'minimumPayment',
          message: 'Minimum payment must be greater than 0'
        }]
      });
    }

    if (interestRate < 0 || interestRate > 50) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: [{
          field: 'interestRate',
          message: 'Interest rate must be between 0 and 50'
        }]
      });
    }

    if (dueDate < 1 || dueDate > 31) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: [{
          field: 'dueDate',
          message: 'Due date must be between 1 and 31'
        }]
      });
    }
    
    const debt = await EnhancedDebt.create(userId, debtData);
    
    // Check if this is the user's first debt entry for email automation
    const allDebts = await EnhancedDebt.findByUserId(userId);
    if (allDebts.length === 1) {
      try {
        const totalDebt = allDebts.reduce((sum, debt) => sum + debt.balance, 0);
        await emailAutomationService.triggerFirstDebtEntry(userId, {
          debtCount: allDebts.length,
          totalDebt: totalDebt
        });
        logger.info('First debt entry email triggered', { userId, debtCount: allDebts.length });
      } catch (emailError) {
        logger.error('Failed to trigger first debt entry email', emailError.message);
      }
    }
    
    res.status(201).json({ 
      success: true, 
      data: debt.toJSON(),
      message: 'Debt created successfully'
    });
  } catch (error) {
    logger.error('Error creating debt', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create debt',
      error: error.message 
    });
  }
});

// Update a debt
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const debtId = req.params.id;
    const debtData = req.body;
    
    // Validate required fields
    const { name, balance, interestRate, minimumPayment, dueDate, debtType } = debtData;
    
    if (!name || balance === undefined || interestRate === undefined || 
        minimumPayment === undefined || !dueDate || !debtType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields',
        errors: [{
          field: 'required',
          message: 'Name, balance, interest rate, minimum payment, due date, and debt type are required'
        }]
      });
    }
    
    const debt = await EnhancedDebt.update(debtId, userId, debtData);
    
    res.json({ 
      success: true, 
      data: debt.toJSON(),
      message: 'Debt updated successfully'
    });
  } catch (error) {
    if (error.message === 'Debt not found or access denied') {
      return res.status(404).json({ 
        success: false, 
        message: 'Debt not found' 
      });
    }
    
    logger.error('Error updating debt', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update debt',
      error: error.message 
    });
  }
});

// Mark debt as paid off
router.put('/:id/mark-paid', async (req, res) => {
  try {
    const userId = req.user.id;
    const debtId = req.params.id;
    
    const debt = await EnhancedDebt.markAsPaidOff(debtId, userId);
    
    // Trigger milestone email automation
    try {
      const allDebts = await EnhancedDebt.findByUserId(userId, true); // Include inactive
      const paidDebts = allDebts.filter(d => d.isPaidOff);
      const totalOriginalDebt = allDebts.reduce((sum, d) => sum + d.originalBalance, 0);
      const totalPaidDebt = paidDebts.reduce((sum, d) => sum + d.originalBalance, 0);
      const progressPercentage = totalOriginalDebt > 0 ? (totalPaidDebt / totalOriginalDebt) * 100 : 0;
      
      // Determine milestone type
      let milestoneType = '';
      if (paidDebts.length === 1) {
        milestoneType = 'first_debt_paid';
      } else if (progressPercentage >= 100) {
        milestoneType = 'debt_free';
      } else if (progressPercentage >= 75) {
        milestoneType = 'debt_milestone_75';
      } else if (progressPercentage >= 50) {
        milestoneType = 'debt_milestone_50';
      } else if (progressPercentage >= 25) {
        milestoneType = 'debt_milestone_25';
      }
      
      if (milestoneType) {
        await emailAutomationService.triggerDebtMilestone(userId, {
          milestoneType,
          debtName: debt.name,
          amount: debt.originalBalance,
          percentage: Math.round(progressPercentage),
          totalDebt: totalOriginalDebt,
          remainingDebt: totalOriginalDebt - totalPaidDebt
        });
        
        logger.info('Debt milestone email triggered', { 
          userId, 
          milestoneType, 
          progressPercentage 
        });
      }
    } catch (emailError) {
      logger.error('Failed to trigger milestone email', emailError.message);
    }
    
    res.json({ 
      success: true, 
      data: debt.toJSON(),
      message: 'Debt marked as paid off successfully'
    });
  } catch (error) {
    if (error.message === 'Debt not found or access denied') {
      return res.status(404).json({ 
        success: false, 
        message: 'Debt not found' 
      });
    }
    
    logger.error('Error marking debt as paid off', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark debt as paid off',
      error: error.message 
    });
  }
});

// Delete a debt
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const debtId = req.params.id;
    
    await EnhancedDebt.delete(debtId, userId);
    
    res.json({ 
      success: true, 
      message: 'Debt deleted successfully' 
    });
  } catch (error) {
    if (error.message === 'Debt not found or access denied') {
      return res.status(404).json({ 
        success: false, 
        message: 'Debt not found' 
      });
    }
    
    logger.error('Error deleting debt', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete debt',
      error: error.message 
    });
  }
});

// Calculate payoff scenarios
router.post('/calculate-payoff', async (req, res) => {
  try {
    const userId = req.user.id;
    const { extraPayment = 0 } = req.body;
    
    const scenarios = await EnhancedDebt.calculatePayoffScenarios(userId, extraPayment);
    
    // Track calculator usage for email automation
    try {
      const allDebts = await EnhancedDebt.findByUserId(userId);
      const bestScenario = scenarios.avalanche.totalInterest < scenarios.snowball.totalInterest 
        ? scenarios.avalanche : scenarios.snowball;
        
      await emailAutomationService.triggerCalculatorUsed(userId, {
        strategy: bestScenario.method === 'snowball' ? 'Debt Snowball' : 'Debt Avalanche',
        monthsToPayoff: bestScenario.totalMonths,
        totalInterest: bestScenario.totalInterest,
        extraPayment: extraPayment,
        debtCount: allDebts.length,
        totalDebt: allDebts.reduce((sum, debt) => sum + debt.balance, 0)
      });
      
      logger.info('Calculator usage email triggered', { 
        userId, 
        strategy: bestScenario.method,
        extraPayment 
      });
    } catch (emailError) {
      logger.error('Failed to trigger calculator usage email', emailError.message);
    }
    
    res.json({ 
      success: true, 
      data: scenarios 
    });
  } catch (error) {
    logger.error('Error calculating payoff scenarios', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to calculate payoff scenarios',
      error: error.message 
    });
  }
});

// Bulk create debts (for CSV import)
router.post('/bulk', async (req, res) => {
  try {
    const userId = req.user.id;
    const { debts: debtsData } = req.body;
    
    if (!Array.isArray(debtsData) || debtsData.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid debts data. Expected array of debt objects.' 
      });
    }
    
    const createdDebts = [];
    const errors = [];
    
    for (let i = 0; i < debtsData.length; i++) {
      try {
        const debt = await EnhancedDebt.create(userId, debtsData[i]);
        createdDebts.push(debt.toJSON());
      } catch (error) {
        errors.push({
          index: i,
          data: debtsData[i],
          error: error.message
        });
      }
    }
    
    // Record bulk import activity
    if (createdDebts.length > 0) {
      try {
        await userActivityService.recordActivity(userId, 'bulk_debt_import', {
          importedCount: createdDebts.length,
          errorCount: errors.length
        });
      } catch (activityError) {
        logger.error('Failed to record bulk import activity', activityError.message);
      }
    }
    
    res.status(201).json({ 
      success: true, 
      data: {
        created: createdDebts,
        errors: errors,
        summary: {
          total: debtsData.length,
          created: createdDebts.length,
          failed: errors.length
        }
      },
      message: `Successfully created ${createdDebts.length} debts${errors.length > 0 ? ` (${errors.length} failed)` : ''}`
    });
  } catch (error) {
    logger.error('Error in bulk debt creation', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create debts in bulk',
      error: error.message 
    });
  }
});

module.exports = router;
