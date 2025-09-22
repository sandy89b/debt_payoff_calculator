const { pool } = require('../config/database');
const logger = require('../utils/logger');
const emailAutomationService = require('./emailAutomationService');
const smsService = require('./smsService'); // We'll create this next

class DebtBalanceMonitor {
  constructor() {
    this.checkInterval = 5 * 60 * 1000; // Check every 5 minutes
    this.isRunning = false;
  }

  // Start monitoring debt balances
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    logger.info('Debt Balance Monitor started');
    
    // Run initial check
    this.checkAllDebts();
    
    // Set up recurring checks
    this.intervalId = setInterval(() => {
      this.checkAllDebts();
    }, this.checkInterval);
  }

  // Stop monitoring
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    logger.info('Debt Balance Monitor stopped');
  }

  // Check all active debts for zero balance
  async checkAllDebts() {
    try {
      const query = `
        SELECT d.*, u.email, u.phone_number, u.notification_preferences
        FROM debts d
        JOIN users u ON d.user_id = u.id
        WHERE d.debt_status = 'active' 
        AND d.balance <= 0.01 
        AND d.auto_detected_payoff = false
        AND d.balance_reached_zero_at IS NULL
      `;
      
      const result = await pool.query(query);
      const zeroBalanceDebts = result.rows;
      
      if (zeroBalanceDebts.length > 0) {
        logger.info(`Found ${zeroBalanceDebts.length} debts with zero balance`, {
          debtIds: zeroBalanceDebts.map(d => d.id)
        });
        
        for (const debt of zeroBalanceDebts) {
          await this.handleZeroBalanceDebt(debt);
        }
      }
      
    } catch (error) {
      logger.error('Error checking debt balances', error.message);
    }
  }

  // Handle a debt that has reached zero balance
  async handleZeroBalanceDebt(debt) {
    try {
      // Mark debt as auto-detected payoff
      await this.markDebtAsZeroBalance(debt.id);
      
      // Get user notification preferences
      const preferences = debt.notification_preferences || { email: true, sms: false };
      
      // Send notifications based on preferences
      if (preferences.email) {
        await this.sendPayoffReminderEmail(debt);
      }
      
      if (preferences.sms && debt.phone_number) {
        await this.sendPayoffReminderSMS(debt);
      }
      
      // Log the notification
      await this.logNotification(debt.id, debt.user_id, 
        preferences.sms && debt.phone_number ? 'both' : 'email');
      
      logger.info('Zero balance debt processed successfully', {
        debtId: debt.id,
        userId: debt.user_id,
        debtName: debt.name
      });
      
    } catch (error) {
      logger.error('Error handling zero balance debt', error.message);
    }
  }

  // Mark debt as having reached zero balance
  async markDebtAsZeroBalance(debtId) {
    const query = `
      UPDATE debts 
      SET balance_reached_zero_at = CURRENT_TIMESTAMP,
          auto_detected_payoff = true
      WHERE id = $1
    `;
    
    await pool.query(query, [debtId]);
  }

  // Send email reminder to mark debt as paid off
  async sendPayoffReminderEmail(debt) {
    try {
      const emailData = {
        userName: debt.email.split('@')[0], // Simple name extraction
        debtName: debt.name,
        amount: this.formatCurrency(debt.original_balance || debt.balance),
        balanceReachedDate: new Date().toLocaleDateString()
      };
      
      // Trigger the "debt_payoff_reminder" email campaign
      await emailAutomationService.triggerCampaignByEvent(
        'debt_payoff_reminder', 
        debt.user_id, 
        emailData
      );
      
      logger.info('Payoff reminder email sent', {
        debtId: debt.id,
        userId: debt.user_id,
        email: debt.email
      });
      
    } catch (error) {
      logger.error('Error sending payoff reminder email', error.message);
    }
  }

  // Send SMS reminder to mark debt as paid off
  async sendPayoffReminderSMS(debt) {
    try {
      const message = `🎉 Congratulations! Your "${debt.name}" balance has reached $0! Please log into your account to officially mark it as PAID OFF and celebrate this victory! 💪`;
      
      await smsService.sendSMS(debt.phone_number, message);
      
      logger.info('Payoff reminder SMS sent', {
        debtId: debt.id,
        userId: debt.user_id,
        phone: debt.phone_number
      });
      
    } catch (error) {
      logger.error('Error sending payoff reminder SMS', error.message);
    }
  }

  // Log notification in database
  async logNotification(debtId, userId, notificationType) {
    const query = `
      INSERT INTO debt_payoff_notifications (debt_id, user_id, notification_type, status, sent_at)
      VALUES ($1, $2, $3, 'sent', CURRENT_TIMESTAMP)
    `;
    
    await pool.query(query, [debtId, userId, notificationType]);
  }

  // Check specific debt balance (called when debt is updated)
  async checkDebtBalance(debtId, userId) {
    try {
      const query = `
        SELECT d.*, u.email, u.phone_number, u.notification_preferences
        FROM debts d
        JOIN users u ON d.user_id = u.id
        WHERE d.id = $1 AND d.user_id = $2
        AND d.debt_status = 'active'
        AND d.balance <= 0.01
        AND d.auto_detected_payoff = false
      `;
      
      const result = await pool.query(query, [debtId, userId]);
      
      if (result.rows.length > 0) {
        const debt = result.rows[0];
        await this.handleZeroBalanceDebt(debt);
        return true; // Indicates debt reached zero
      }
      
      return false;
      
    } catch (error) {
      logger.error('Error checking specific debt balance', error.message);
      return false;
    }
  }

  // Record balance change in history
  async recordBalanceChange(debtId, userId, previousBalance, newBalance, paymentAmount, changeType = 'payment', notes = '') {
    try {
      const query = `
        INSERT INTO debt_balance_history (debt_id, user_id, previous_balance, new_balance, payment_amount, change_type, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      
      await pool.query(query, [debtId, userId, previousBalance, newBalance, paymentAmount, changeType, notes]);
      
      // Check if this balance change resulted in zero balance
      if (newBalance <= 0.01 && previousBalance > 0.01) {
        await this.checkDebtBalance(debtId, userId);
      }
      
    } catch (error) {
      logger.error('Error recording balance change', error.message);
    }
  }

  // Utility function to format currency
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  }

  // Get status of the monitor
  getStatus() {
    return {
      isRunning: this.isRunning,
      checkInterval: this.checkInterval,
      nextCheck: this.intervalId ? new Date(Date.now() + this.checkInterval) : null
    };
  }
}

module.exports = new DebtBalanceMonitor();
