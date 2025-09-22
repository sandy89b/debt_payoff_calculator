const express = require('express');
const router = express.Router();
const EnhancedDebt = require('../models/EnhancedDebt');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

// Apply authentication to all routes
router.use(authenticateToken);

// Record a payment towards a debt
router.post('/:debtId/payments', async (req, res) => {
  try {
    const { debtId } = req.params;
    const { amount, notes } = req.body;
    const userId = req.user.id;

    // Validate payment amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount must be greater than zero'
      });
    }

    // Get the debt
    const debt = await EnhancedDebt.findById(debtId, userId);
    if (!debt) {
      return res.status(404).json({
        success: false,
        message: 'Debt not found'
      });
    }

    // Make the payment
    await debt.makePayment(parseFloat(amount), notes || '');

    logger.info('Payment recorded successfully', {
      debtId,
      userId,
      paymentAmount: amount,
      newBalance: debt.balance
    });

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      data: debt.toJSON()
    });

  } catch (error) {
    logger.error('Error recording payment', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to record payment',
      error: error.message
    });
  }
});

// Update debt balance manually
router.put('/:debtId/balance', async (req, res) => {
  try {
    const { debtId } = req.params;
    const { balance, changeType, notes } = req.body;
    const userId = req.user.id;

    // Validate balance
    if (balance === undefined || balance < 0) {
      return res.status(400).json({
        success: false,
        message: 'Balance must be a non-negative number'
      });
    }

    // Get the debt
    const debt = await EnhancedDebt.findById(debtId, userId);
    if (!debt) {
      return res.status(404).json({
        success: false,
        message: 'Debt not found'
      });
    }

    // Calculate payment amount (if balance decreased)
    const paymentAmount = Math.max(0, debt.balance - parseFloat(balance));

    // Update the balance
    await debt.updateBalance(
      parseFloat(balance), 
      paymentAmount, 
      changeType || 'adjustment', 
      notes || ''
    );

    logger.info('Debt balance updated manually', {
      debtId,
      userId,
      newBalance: balance,
      paymentAmount
    });

    res.json({
      success: true,
      message: 'Balance updated successfully',
      data: debt.toJSON()
    });

  } catch (error) {
    logger.error('Error updating balance', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update balance',
      error: error.message
    });
  }
});

// Get payment history for a debt
router.get('/:debtId/payments/history', async (req, res) => {
  try {
    const { debtId } = req.params;
    const userId = req.user.id;

    // Verify debt ownership
    const debt = await EnhancedDebt.findById(debtId, userId);
    if (!debt) {
      return res.status(404).json({
        success: false,
        message: 'Debt not found'
      });
    }

    // Get payment history
    const query = `
      SELECT 
        id,
        previous_balance,
        new_balance,
        payment_amount,
        change_type,
        notes,
        created_at
      FROM debt_balance_history 
      WHERE debt_id = $1 AND user_id = $2
      ORDER BY created_at DESC
    `;

    const { pool } = require('../config/database');
    const result = await pool.query(query, [debtId, userId]);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        previousBalance: parseFloat(row.previous_balance),
        newBalance: parseFloat(row.new_balance),
        paymentAmount: parseFloat(row.payment_amount || 0),
        changeType: row.change_type,
        notes: row.notes,
        createdAt: row.created_at
      }))
    });

  } catch (error) {
    logger.error('Error fetching payment history', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message
    });
  }
});

// Get debt balance monitoring status
router.get('/:debtId/monitoring-status', async (req, res) => {
  try {
    const { debtId } = req.params;
    const userId = req.user.id;

    // Verify debt ownership
    const debt = await EnhancedDebt.findById(debtId, userId);
    if (!debt) {
      return res.status(404).json({
        success: false,
        message: 'Debt not found'
      });
    }

    // Get monitoring status from database
    const query = `
      SELECT 
        balance_reached_zero_at,
        reminder_sent_at,
        auto_detected_payoff,
        debt_status
      FROM debts 
      WHERE id = $1 AND user_id = $2
    `;

    const { pool } = require('../config/database');
    const result = await pool.query(query, [debtId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Debt not found'
      });
    }

    const status = result.rows[0];

    res.json({
      success: true,
      data: {
        debtId: parseInt(debtId),
        currentBalance: debt.balance,
        balanceReachedZeroAt: status.balance_reached_zero_at,
        reminderSentAt: status.reminder_sent_at,
        autoDetectedPayoff: status.auto_detected_payoff,
        debtStatus: status.debt_status,
        isMonitored: debt.balance <= 0.01 && status.debt_status === 'active'
      }
    });

  } catch (error) {
    logger.error('Error fetching monitoring status', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monitoring status',
      error: error.message
    });
  }
});

module.exports = router;
