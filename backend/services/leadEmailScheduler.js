const cron = require('node-cron');
const { pool } = require('../config/database');
const emailAutomationService = require('./emailAutomationService');
const logger = require('../utils/logger');

class LeadEmailScheduler {
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
  }

  // Start the lead email scheduler
  start() {
    if (this.isRunning) {
      logger.warn('Lead email scheduler is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting lead email scheduler...');

    // Schedule lead nurturing emails every hour
    this.scheduleLeadNurturingEmails();
    
    // Schedule lead status updates every 6 hours
    this.scheduleLeadStatusUpdates();

    logger.info('Lead email scheduler started successfully');
  }

  // Stop the lead email scheduler
  stop() {
    if (!this.isRunning) {
      logger.warn('Lead email scheduler is not running');
      return;
    }

    this.isRunning = false;
    
    // Stop all scheduled jobs
    this.jobs.forEach((job, name) => {
      job.destroy();
      logger.info(`Stopped job: ${name}`);
    });
    
    this.jobs.clear();
    logger.info('Lead email scheduler stopped');
  }

  // Schedule lead nurturing emails
  scheduleLeadNurturingEmails() {
    const job = cron.schedule('0 * * * *', async () => { // Every hour
      try {
        await this.processLeadNurturingEmails();
      } catch (error) {
        logger.error('Error processing lead nurturing emails:', error);
      }
    }, {
      scheduled: false
    });

    this.jobs.set('lead_nurturing', job);
    job.start();
    logger.info('Lead nurturing email job scheduled (every hour)');
  }

  // Schedule lead status updates
  scheduleLeadStatusUpdates() {
    const job = cron.schedule('0 */6 * * *', async () => { // Every 6 hours
      try {
        await this.updateLeadStatuses();
      } catch (error) {
        logger.error('Error updating lead statuses:', error);
      }
    }, {
      scheduled: false
    });

    this.jobs.set('lead_status_updates', job);
    job.start();
    logger.info('Lead status update job scheduled (every 6 hours)');
  }

  // Process lead nurturing emails
  async processLeadNurturingEmails() {
    try {
      // Get leads that need nurturing emails
      const leads = await this.getLeadsForNurturing();
      
      for (const lead of leads) {
        await this.sendNurturingEmail(lead);
      }

      logger.info(`Processed ${leads.length} lead nurturing emails`);
    } catch (error) {
      logger.error('Error processing lead nurturing emails:', error);
    }
  }

  // Get leads that need nurturing emails
  async getLeadsForNurturing() {
    const query = `
      SELECT 
        l.*,
        EXTRACT(EPOCH FROM (NOW() - l.created_at)) / 86400 as days_since_created
      FROM leads l
      WHERE l.status = 'new' 
        AND l.user_id IS NULL
        AND l.created_at < NOW() - INTERVAL '1 hour'
      ORDER BY l.created_at ASC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  // Send nurturing email to a lead
  async sendNurturingEmail(lead) {
    try {
      const daysSinceCreated = Math.floor(lead.days_since_created);
      let triggerEvent = null;
      let templateId = null;

      // Determine which email to send based on days since creation
      if (daysSinceCreated >= 14) {
        triggerEvent = 'lead_day_14';
      } else if (daysSinceCreated >= 7) {
        triggerEvent = 'lead_day_7';
      } else if (daysSinceCreated >= 3) {
        triggerEvent = 'lead_day_3';
      } else {
        // Skip if less than 3 days
        return;
      }

      // Check if we've already sent this email
      const emailSent = await this.hasEmailBeenSent(lead.id, triggerEvent);
      if (emailSent) {
        return;
      }

      // Get template ID for the trigger event
      const templateQuery = `
        SELECT t.id 
        FROM email_templates t
        JOIN email_campaigns c ON t.id = c.template_id
        WHERE c.trigger_event = $1 AND c.is_active = true
      `;
      
      const templateResult = await pool.query(templateQuery, [triggerEvent]);
      if (templateResult.rows.length === 0) {
        logger.warn(`No template found for trigger event: ${triggerEvent}`);
        return;
      }

      templateId = templateResult.rows[0].id;

      // Prepare email variables
      const variables = await this.prepareLeadEmailVariables(lead, triggerEvent);

      // Send the email
      await emailAutomationService.sendTemplateEmail(
        templateId,
        lead.email,
        variables
      );

      // Record that the email was sent
      await this.recordEmailSent(lead.id, triggerEvent, templateId);

      logger.info(`Sent ${triggerEvent} email to lead ${lead.id} (${lead.email})`);

    } catch (error) {
      logger.error(`Error sending nurturing email to lead ${lead.id}:`, error);
    }
  }

  // Prepare email variables for lead emails
  async prepareLeadEmailVariables(lead, triggerEvent) {
    const variables = {
      firstName: lead.first_name,
      totalDebt: `$${parseFloat(lead.total_debt).toLocaleString()}`,
      debtCount: lead.debt_count,
      totalMinPayments: `$${parseFloat(lead.total_min_payments).toLocaleString()}`,
      extraPayment: `$${parseFloat(lead.extra_payment).toLocaleString()}`,
      platformUrl: process.env.FRONTEND_URL || 'http://localhost:8080'
    };

    // Add calculation results if available
    if (lead.calculation_results) {
      const results = typeof lead.calculation_results === 'string' 
        ? JSON.parse(lead.calculation_results) 
        : lead.calculation_results;

      if (results.snowball) {
        variables.snowballMonths = results.snowball.totalMonths;
        variables.avalancheMonths = results.avalanche.totalMonths;
        variables.interestSaved = `$${Math.round(results.snowball.totalInterest - results.avalanche.totalInterest).toLocaleString()}`;
      }
    }

    // Add personalized messages based on trigger event
    switch (triggerEvent) {
      case 'lead_day_3':
        variables.encouragementMessage = this.getEncouragementMessage(lead);
        variables.motivationalMessage = this.getMotivationalMessage(lead);
        variables.proTip = this.getProTip(lead);
        break;
      case 'lead_day_7':
        variables.dailyInterestCost = this.calculateDailyInterestCost(lead);
        variables.urgencyMessage = this.getUrgencyMessage(lead);
        break;
      case 'lead_day_14':
        variables.finalMessage = this.getFinalMessage(lead);
        break;
    }

    return variables;
  }

  // Get encouragement message based on lead data
  getEncouragementMessage(lead) {
    const debtAmount = parseFloat(lead.total_debt);
    
    if (debtAmount < 10000) {
      return "You're closer to debt freedom than you think! With your current plan, you could be debt-free in just a few years.";
    } else if (debtAmount < 50000) {
      return "Your debt situation is manageable, and with the right strategy, you can eliminate it faster than you imagined.";
    } else {
      return "Even with significant debt, you have a clear path to freedom. Many people have paid off much more and achieved their goals.";
    }
  }

  // Get motivational message
  getMotivationalMessage(lead) {
    const debtCount = lead.debt_count;
    
    if (debtCount === 1) {
      return "You have just one debt to focus on - that's actually an advantage! You can channel all your energy into eliminating it quickly.";
    } else if (debtCount <= 3) {
      return "With just a few debts, you're in a great position to make rapid progress. The snowball effect will work beautifully for you.";
    } else {
      return "You have multiple debts, but that also means multiple opportunities to celebrate victories as you eliminate them one by one.";
    }
  }

  // Get pro tip based on lead data
  getProTip(lead) {
    const extraPayment = parseFloat(lead.extra_payment);
    
    if (extraPayment > 0) {
      return `Your extra payment of $${extraPayment.toLocaleString()} per month will accelerate your debt freedom by months or even years!`;
    } else {
      return "Even small extra payments can make a huge difference. Consider starting with just $25-50 extra per month.";
    }
  }

  // Calculate daily interest cost
  calculateDailyInterestCost(lead) {
    const totalDebt = parseFloat(lead.total_debt);
    const avgInterestRate = 0.15; // Assume 15% average interest rate
    const dailyInterest = (totalDebt * avgInterestRate) / 365;
    return `$${Math.round(dailyInterest).toLocaleString()}`;
  }

  // Get urgency message
  getUrgencyMessage(lead) {
    const debtAmount = parseFloat(lead.total_debt);
    
    if (debtAmount < 10000) {
      return "You're so close to being debt-free! Don't let this opportunity slip away.";
    } else if (debtAmount < 50000) {
      return "Every day you wait is another day of interest charges. Your future self will thank you for starting today.";
    } else {
      return "The longer you wait, the more interest you'll pay. But the sooner you start, the sooner you'll be free.";
    }
  }

  // Get final message
  getFinalMessage(lead) {
    const debtAmount = parseFloat(lead.total_debt);
    
    if (debtAmount < 10000) {
      return "You have a clear path to debt freedom. This is your moment to take control of your financial future.";
    } else if (debtAmount < 50000) {
      return "You've already done the hard work of creating a plan. Now it's time to execute it and change your life.";
    } else {
      return "Your plan shows you exactly how to eliminate your debt. Don't let fear or doubt stop you from starting your journey to freedom.";
    }
  }

  // Check if email has already been sent
  async hasEmailBeenSent(leadId, triggerEvent) {
    const query = `
      SELECT id FROM lead_email_log 
      WHERE lead_id = $1 AND trigger_event = $2
    `;
    
    const result = await pool.query(query, [leadId, triggerEvent]);
    return result.rows.length > 0;
  }

  // Record that an email was sent
  async recordEmailSent(leadId, triggerEvent, templateId) {
    const query = `
      INSERT INTO lead_email_log (lead_id, trigger_event, template_id, sent_at)
      VALUES ($1, $2, $3, NOW())
    `;
    
    await pool.query(query, [leadId, triggerEvent, templateId]);
  }

  // Update lead statuses based on engagement
  async updateLeadStatuses() {
    try {
      // Move leads to 'nurturing' status after 3 days
      const nurturingQuery = `
        UPDATE leads 
        SET status = 'nurturing', updated_at = NOW()
        WHERE status = 'new' 
          AND created_at < NOW() - INTERVAL '3 days'
          AND user_id IS NULL
      `;
      
      const nurturingResult = await pool.query(nurturingQuery);
      
      // Move leads to 'lost' status after 30 days with no conversion
      const lostQuery = `
        UPDATE leads 
        SET status = 'lost', updated_at = NOW()
        WHERE status IN ('new', 'nurturing')
          AND created_at < NOW() - INTERVAL '30 days'
          AND user_id IS NULL
      `;
      
      const lostResult = await pool.query(lostQuery);
      
      logger.info(`Updated lead statuses: ${nurturingResult.rowCount} to nurturing, ${lostResult.rowCount} to lost`);
      
    } catch (error) {
      logger.error('Error updating lead statuses:', error);
    }
  }

  // Get scheduler status
  getStatus() {
    return {
      isRunning: this.isRunning,
      jobs: Array.from(this.jobs.keys()),
      jobCount: this.jobs.size
    };
  }
}

module.exports = new LeadEmailScheduler();
