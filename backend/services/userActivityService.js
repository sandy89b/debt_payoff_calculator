const { pool } = require('../config/database');
const emailAutomationService = require('./emailAutomationService');
const logger = require('../utils/logger');

class UserActivityService {
  // Record user activity
  async recordActivity(userId, activityType, activityData = {}) {
    try {
      // Insert activity record
      await pool.query(
        `INSERT INTO user_activities (user_id, activity_type, activity_data) VALUES ($1, $2, $3)`,
        [userId, activityType, JSON.stringify(activityData)]
      );
      
      // Update last activity in users table
      await pool.query(
        `UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [userId]
      );
      
      logger.info('User activity recorded', { userId, activityType });
      
      // Trigger specific email automations based on activity type
      await this.handleActivityTriggers(userId, activityType, activityData);
      
    } catch (error) {
      logger.error('Error recording user activity', error.message);
    }
  }
  
  // Handle email triggers based on activity
  async handleActivityTriggers(userId, activityType, activityData) {
    try {
      switch (activityType) {
        case 'goal_created':
          await emailAutomationService.triggerGoalCreated(userId, activityData);
          break;
          
        case 'pdf_exported':
          await emailAutomationService.triggerPdfExported(userId, activityData);
          break;
          
        case 'debt_paid_off':
          await this.handleDebtPayoff(userId, activityData);
          break;
          
        default:
          // No specific trigger for this activity type
          break;
      }
    } catch (error) {
      logger.error('Error handling activity triggers', error.message);
    }
  }
  
  // Handle debt payoff milestones
  async handleDebtPayoff(userId, debtData) {
    try {
      const { debtName, debtAmount } = debtData;
      
      // Get all user debts to calculate progress
      const debtsQuery = `
        SELECT * FROM debts 
        WHERE user_id = $1 AND is_active = true
        ORDER BY created_at ASC
      `;
      const debtsResult = await pool.query(debtsQuery, [userId]);
      const allDebts = debtsResult.rows;
      
      // Get paid off debts
      const paidDebtsQuery = `
        SELECT * FROM debts 
        WHERE user_id = $1 AND paid_off_date IS NOT NULL
        ORDER BY paid_off_date ASC
      `;
      const paidDebtsResult = await pool.query(paidDebtsQuery, [userId]);
      const paidDebts = paidDebtsResult.rows;
      
      // Calculate total debt and progress
      const totalOriginalDebt = allDebts.reduce((sum, debt) => sum + parseFloat(debt.original_balance || debt.balance), 0);
      const totalPaidDebt = paidDebts.reduce((sum, debt) => sum + parseFloat(debt.original_balance || debt.balance), 0);
      const remainingDebt = allDebts.reduce((sum, debt) => sum + parseFloat(debt.balance), 0);
      const progressPercentage = totalOriginalDebt > 0 ? (totalPaidDebt / totalOriginalDebt) * 100 : 0;
      
      // Determine milestone type
      let milestoneType = '';
      if (paidDebts.length === 1) {
        milestoneType = 'first_debt_paid';
      } else if (remainingDebt <= 0) {
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
          debtName,
          amount: debtAmount,
          percentage: Math.round(progressPercentage),
          totalDebt: totalOriginalDebt,
          remainingDebt: remainingDebt
        });
        
        logger.info('Debt milestone email triggered', { 
          userId, 
          milestoneType, 
          progressPercentage 
        });
      }
      
    } catch (error) {
      logger.error('Error handling debt payoff milestone', error.message);
    }
  }
  
  // Check for inactive users and send re-engagement emails
  async checkInactiveUsers() {
    try {
      // Get users inactive for 7+ days
      const sevenDayInactiveQuery = `
        SELECT u.id, u.first_name, u.last_name, u.email, u.updated_at,
               EXTRACT(DAY FROM (CURRENT_TIMESTAMP - u.updated_at)) as days_inactive
        FROM users u
        LEFT JOIN user_email_preferences ep ON u.id = ep.user_id
        WHERE EXTRACT(DAY FROM (CURRENT_TIMESTAMP - u.updated_at)) >= 7
          AND EXTRACT(DAY FROM (CURRENT_TIMESTAMP - u.updated_at)) < 30
          AND (ep.engagement_emails IS NULL OR ep.engagement_emails = true)
          AND u.email_verified = true
      `;
      
      const sevenDayResult = await pool.query(sevenDayInactiveQuery);
      
      for (const user of sevenDayResult.rows) {
        // Check if we already sent a 7-day inactivity email recently
        const recentEmailQuery = `
          SELECT COUNT(*) as count
          FROM email_sends es
          JOIN email_campaigns ec ON es.campaign_id = ec.id
          WHERE es.user_id = $1 
            AND ec.trigger_event = 'user_inactive_7_days'
            AND es.sent_at > CURRENT_TIMESTAMP - INTERVAL '7 days'
        `;
        
        const recentEmailResult = await pool.query(recentEmailQuery, [user.id]);
        
        if (recentEmailResult.rows[0].count === '0') {
          await emailAutomationService.triggerUserInactivity(user.id, {
            daysSinceLastLogin: Math.floor(user.days_inactive),
            lastActivity: user.updated_at.toLocaleDateString()
          });
          
          logger.info('7-day inactivity email triggered', { 
            userId: user.id, 
            daysInactive: user.days_inactive 
          });
        }
      }
      
      // Get users inactive for 30+ days
      const thirtyDayInactiveQuery = `
        SELECT u.id, u.first_name, u.last_name, u.email, u.updated_at,
               EXTRACT(DAY FROM (CURRENT_TIMESTAMP - u.updated_at)) as days_inactive
        FROM users u
        LEFT JOIN user_email_preferences ep ON u.id = ep.user_id
        WHERE EXTRACT(DAY FROM (CURRENT_TIMESTAMP - u.updated_at)) >= 30
          AND (ep.marketing_emails IS NULL OR ep.marketing_emails = true)
          AND u.email_verified = true
      `;
      
      const thirtyDayResult = await pool.query(thirtyDayInactiveQuery);
      
      for (const user of thirtyDayResult.rows) {
        // Check if we already sent a 30-day inactivity email recently
        const recentEmailQuery = `
          SELECT COUNT(*) as count
          FROM email_sends es
          JOIN email_campaigns ec ON es.campaign_id = ec.id
          WHERE es.user_id = $1 
            AND ec.trigger_event = 'user_inactive_30_days'
            AND es.sent_at > CURRENT_TIMESTAMP - INTERVAL '30 days'
        `;
        
        const recentEmailResult = await pool.query(recentEmailQuery, [user.id]);
        
        if (recentEmailResult.rows[0].count === '0') {
          await emailAutomationService.triggerUserInactivity(user.id, {
            daysSinceLastLogin: Math.floor(user.days_inactive),
            lastActivity: user.updated_at.toLocaleDateString()
          });
          
          logger.info('30-day inactivity email triggered', { 
            userId: user.id, 
            daysInactive: user.days_inactive 
          });
        }
      }
      
    } catch (error) {
      logger.error('Error checking inactive users', error.message);
    }
  }
  
  // Send weekly check-in emails
  async sendWeeklyCheckIns() {
    try {
      // Get active users who want weekly check-ins
      const usersQuery = `
        SELECT u.id, u.first_name, u.last_name, u.email
        FROM users u
        LEFT JOIN user_email_preferences ep ON u.id = ep.user_id
        WHERE u.email_verified = true
          AND (ep.weekly_checkins IS NULL OR ep.weekly_checkins = true)
          AND EXTRACT(DAY FROM (CURRENT_TIMESTAMP - u.updated_at)) < 30
      `;
      
      const usersResult = await pool.query(usersQuery);
      
      for (const user of usersResult.rows) {
        // Check if we already sent a weekly check-in this week
        const recentEmailQuery = `
          SELECT COUNT(*) as count
          FROM email_sends es
          JOIN email_campaigns ec ON es.campaign_id = ec.id
          WHERE es.user_id = $1 
            AND ec.trigger_event = 'weekly_check_in'
            AND es.sent_at > CURRENT_TIMESTAMP - INTERVAL '7 days'
        `;
        
        const recentEmailResult = await pool.query(recentEmailQuery, [user.id]);
        
        if (recentEmailResult.rows[0].count === '0') {
          // Get user's progress data
          const progressData = await this.getUserProgressData(user.id);
          
          await emailAutomationService.triggerWeeklyCheckIn(user.id, progressData);
          
          logger.info('Weekly check-in email triggered', { userId: user.id });
        }
      }
      
    } catch (error) {
      logger.error('Error sending weekly check-ins', error.message);
    }
  }
  
  // Send monthly progress reports
  async sendMonthlyReports() {
    try {
      // Get active users who want monthly reports
      const usersQuery = `
        SELECT u.id, u.first_name, u.last_name, u.email
        FROM users u
        LEFT JOIN user_email_preferences ep ON u.id = ep.user_id
        WHERE u.email_verified = true
          AND (ep.monthly_reports IS NULL OR ep.monthly_reports = true)
          AND EXTRACT(DAY FROM (CURRENT_TIMESTAMP - u.updated_at)) < 60
      `;
      
      const usersResult = await pool.query(usersQuery);
      
      for (const user of usersResult.rows) {
        // Check if we already sent a monthly report this month
        const recentEmailQuery = `
          SELECT COUNT(*) as count
          FROM email_sends es
          JOIN email_campaigns ec ON es.campaign_id = ec.id
          WHERE es.user_id = $1 
            AND ec.trigger_event = 'monthly_report'
            AND es.sent_at > CURRENT_TIMESTAMP - INTERVAL '30 days'
        `;
        
        const recentEmailResult = await pool.query(recentEmailQuery, [user.id]);
        
        if (recentEmailResult.rows[0].count === '0') {
          // Get user's monthly progress data
          const monthlyData = await this.getUserMonthlyData(user.id);
          
          await emailAutomationService.triggerMonthlyReport(user.id, monthlyData);
          
          logger.info('Monthly report email triggered', { userId: user.id });
        }
      }
      
    } catch (error) {
      logger.error('Error sending monthly reports', error.message);
    }
  }
  
  // Get user progress data for weekly check-ins
  async getUserProgressData(userId) {
    try {
      // Get debt progress
      const debtsQuery = `
        SELECT COUNT(*) as total_debts,
               SUM(CASE WHEN paid_off_date IS NOT NULL THEN 1 ELSE 0 END) as paid_debts,
               SUM(balance) as remaining_balance
        FROM debts WHERE user_id = $1
      `;
      const debtsResult = await pool.query(debtsQuery, [userId]);
      const debtStats = debtsResult.rows[0];
      
      // Get framework progress
      const frameworkQuery = `
        SELECT COUNT(*) as completed_steps
        FROM user_framework_progress 
        WHERE user_id = $1 AND completed = true
      `;
      const frameworkResult = await pool.query(frameworkQuery, [userId]);
      const frameworkStats = frameworkResult.rows[0];
      
      return {
        weeklyProgress: debtStats.paid_debts > 0 ? 
          `${debtStats.paid_debts} debt(s) paid off!` : 
          'Keep working on your debt elimination plan',
        totalProgress: `${debtStats.paid_debts}/${debtStats.total_debts} debts eliminated`,
        motivationalMessage: this.getMotivationalMessage(debtStats, frameworkStats)
      };
      
    } catch (error) {
      logger.error('Error getting user progress data', error.message);
      return {
        weeklyProgress: 'Keep going!',
        totalProgress: 'Every step counts',
        motivationalMessage: 'You\'re doing great!'
      };
    }
  }
  
  // Get user monthly data for reports
  async getUserMonthlyData(userId) {
    try {
      // Get debt payments in the last month
      const paymentsQuery = `
        SELECT COUNT(*) as payments_made,
               SUM(amount) as total_paid
        FROM debt_payments 
        WHERE user_id = $1 
          AND payment_date > CURRENT_DATE - INTERVAL '30 days'
      `;
      const paymentsResult = await pool.query(paymentsQuery, [userId]);
      const paymentStats = paymentsResult.rows[0];
      
      // Get milestones reached this month
      const milestonesQuery = `
        SELECT COUNT(*) as milestones
        FROM user_milestones
        WHERE user_id = $1 
          AND achieved_at > CURRENT_DATE - INTERVAL '30 days'
      `;
      const milestonesResult = await pool.query(milestonesQuery, [userId]);
      const milestoneStats = milestonesResult.rows[0];
      
      // Get framework progress
      const frameworkQuery = `
        SELECT COUNT(*) as completed_steps
        FROM user_framework_progress 
        WHERE user_id = $1 AND completed = true
      `;
      const frameworkResult = await pool.query(frameworkQuery, [userId]);
      const frameworkStats = frameworkResult.rows[0];
      
      return {
        debtPaid: paymentStats.total_paid || 0,
        interestSaved: 0, // Would need more complex calculation
        milestonesReached: milestoneStats.milestones || 0,
        frameworkProgress: Math.round((frameworkStats.completed_steps / 6) * 100)
      };
      
    } catch (error) {
      logger.error('Error getting user monthly data', error.message);
      return {
        debtPaid: 0,
        interestSaved: 0,
        milestonesReached: 0,
        frameworkProgress: 0
      };
    }
  }
  
  getMotivationalMessage(debtStats, frameworkStats) {
    if (debtStats.paid_debts > 0) {
      return `Amazing! You've eliminated ${debtStats.paid_debts} debt(s). Keep the momentum going!`;
    } else if (frameworkStats.completed_steps > 0) {
      return `Great job completing ${frameworkStats.completed_steps} framework step(s). You're building a strong foundation!`;
    } else {
      return `Every journey begins with a single step. You're exactly where you need to be!`;
    }
  }
}

module.exports = new UserActivityService();
