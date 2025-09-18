const emailAutomationService = require('../services/emailAutomationService');
const { pool } = require('../config/database');
const logger = require('../utils/logger');

class EmailAutomationController {
  // Get all email templates
  static async getTemplates(req, res) {
    try {
      const query = `
        SELECT id, name, subject, template_type, category, is_active, created_at
        FROM email_templates
        ORDER BY created_at DESC
      `;
      const result = await pool.query(query);
      
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      logger.error('Error getting email templates', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get email template by ID
  static async getTemplate(req, res) {
    try {
      const { id } = req.params;
      const template = await emailAutomationService.getTemplate(id);
      
      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }

      res.json({
        success: true,
        data: template
      });
    } catch (error) {
      logger.error('Error getting email template', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Create new email template
  static async createTemplate(req, res) {
    try {
      const { name, subject, html_content, text_content, template_type, category, variables } = req.body;

      if (!name || !subject || !html_content || !template_type) {
        return res.status(400).json({
          success: false,
          message: 'Name, subject, HTML content, and template type are required'
        });
      }

      const query = `
        INSERT INTO email_templates (name, subject, html_content, text_content, template_type, category, variables)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const result = await pool.query(query, [
        name, subject, html_content, text_content, template_type, category, 
        variables ? JSON.stringify(variables) : null
      ]);

      logger.info('Email template created', { templateId: result.rows[0].id, name });
      
      res.status(201).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      logger.error('Error creating email template', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update email template
  static async updateTemplate(req, res) {
    try {
      const { id } = req.params;
      const { name, subject, html_content, text_content, template_type, category, variables, is_active } = req.body;

      const query = `
        UPDATE email_templates 
        SET name = COALESCE($1, name),
            subject = COALESCE($2, subject),
            html_content = COALESCE($3, html_content),
            text_content = COALESCE($4, text_content),
            template_type = COALESCE($5, template_type),
            category = COALESCE($6, category),
            variables = COALESCE($7, variables),
            is_active = COALESCE($8, is_active),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
        RETURNING *
      `;
      const result = await pool.query(query, [
        name, subject, html_content, text_content, template_type, category,
        variables ? JSON.stringify(variables) : null, is_active, id
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }

      logger.info('Email template updated', { templateId: id });
      
      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      logger.error('Error updating email template', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Delete email template
  static async deleteTemplate(req, res) {
    try {
      const { id } = req.params;

      // Check if template is used in campaigns
      const campaignQuery = 'SELECT COUNT(*) FROM email_campaigns WHERE template_id = $1';
      const campaignResult = await pool.query(campaignQuery, [id]);
      
      if (parseInt(campaignResult.rows[0].count) > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete template that is used in campaigns'
        });
      }

      const query = 'DELETE FROM email_templates WHERE id = $1';
      await pool.query(query, [id]);

      logger.info('Email template deleted', { templateId: id });
      
      res.json({
        success: true,
        message: 'Template deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting email template', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get all email campaigns
  static async getCampaigns(req, res) {
    try {
      const query = `
        SELECT c.*, t.name as template_name
        FROM email_campaigns c
        LEFT JOIN email_templates t ON c.template_id = t.id
        ORDER BY c.created_at DESC
      `;
      const result = await pool.query(query);
      
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      logger.error('Error getting email campaigns', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get email campaign by ID
  static async getCampaign(req, res) {
    try {
      const { id } = req.params;
      const campaign = await emailAutomationService.getCampaign(id);
      
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }

      res.json({
        success: true,
        data: campaign
      });
    } catch (error) {
      logger.error('Error getting email campaign', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Create new email campaign
  static async createCampaign(req, res) {
    try {
      const { 
        name, 
        description, 
        template_id, 
        campaign_type, 
        trigger_event, 
        delay_days, 
        send_time, 
        target_criteria 
      } = req.body;

      if (!name || !campaign_type) {
        return res.status(400).json({
          success: false,
          message: 'Name and campaign type are required'
        });
      }

      const query = `
        INSERT INTO email_campaigns (name, description, template_id, campaign_type, trigger_event, delay_days, send_time, target_criteria)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      const result = await pool.query(query, [
        name, description, template_id, campaign_type, trigger_event, 
        delay_days || 0, send_time || '09:00:00', 
        target_criteria ? JSON.stringify(target_criteria) : null
      ]);

      logger.info('Email campaign created', { campaignId: result.rows[0].id, name });
      
      res.status(201).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      logger.error('Error creating email campaign', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update email campaign
  static async updateCampaign(req, res) {
    try {
      const { id } = req.params;
      const { 
        name, 
        description, 
        template_id, 
        campaign_type, 
        trigger_event, 
        delay_days, 
        send_time, 
        target_criteria, 
        is_active 
      } = req.body;

      const query = `
        UPDATE email_campaigns 
        SET name = COALESCE($1, name),
            description = COALESCE($2, description),
            template_id = COALESCE($3, template_id),
            campaign_type = COALESCE($4, campaign_type),
            trigger_event = COALESCE($5, trigger_event),
            delay_days = COALESCE($6, delay_days),
            send_time = COALESCE($7, send_time),
            target_criteria = COALESCE($8, target_criteria),
            is_active = COALESCE($9, is_active),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING *
      `;
      const result = await pool.query(query, [
        name, description, template_id, campaign_type, trigger_event,
        delay_days, send_time, 
        target_criteria ? JSON.stringify(target_criteria) : null, 
        is_active, id
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }

      logger.info('Email campaign updated', { campaignId: id });
      
      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      logger.error('Error updating email campaign', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Send test email
  static async sendTestEmail(req, res) {
    try {
      const { campaign_id, test_email, custom_variables } = req.body;

      if (!campaign_id || !test_email) {
        return res.status(400).json({
          success: false,
          message: 'Campaign ID and test email are required'
        });
      }

      // Create a temporary user record for testing
      const testUserData = {
        id: 'test',
        first_name: 'Test',
        last_name: 'User',
        email: test_email,
        debt_count: 3,
        total_debt: 15000,
        ...custom_variables
      };

      const campaign = await emailAutomationService.getCampaign(campaign_id);
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }

      // Check if campaign has a template assigned
      if (!campaign.template_id) {
        return res.status(400).json({
          success: false,
          message: 'Campaign does not have a template associated with it. Please assign a template to the campaign first.'
        });
      }

      // Get the template content
      const template = await emailAutomationService.getTemplate(campaign.template_id);
      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }

      // Check if template has content
      if (!template.html_content && !template.text_content) {
        return res.status(400).json({
          success: false,
          message: 'Template does not have any content. Please add content to the template first.'
        });
      }

      const variables = {
        firstName: testUserData.first_name,
        lastName: testUserData.last_name,
        email: testUserData.email,
        debtCount: testUserData.debt_count,
        totalDebt: testUserData.total_debt,
        ...custom_variables
      };

      const processedTemplate = emailAutomationService.processTemplate(template, variables);
      
      const emailResult = await emailAutomationService.sendEmail(
        test_email,
        processedTemplate.subject,
        processedTemplate.html_content,
        processedTemplate.text_content
      );

      logger.info('Test email sent', { campaignId: campaign_id, testEmail: test_email });
      
      res.json({
        success: true,
        message: 'Test email sent successfully',
        data: emailResult
      });
    } catch (error) {
      logger.error('Error sending test email', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get email analytics
  static async getAnalytics(req, res) {
    try {
      const { campaign_id, date_range } = req.query;
      const analytics = await emailAutomationService.getEmailAnalytics(
        campaign_id ? parseInt(campaign_id) : null,
        date_range ? parseInt(date_range) : 30
      );

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('Error getting email analytics', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get email sends history
  static async getEmailSends(req, res) {
    try {
      const { campaign_id, user_id, status, limit = 50, offset = 0 } = req.query;
      
      let query = `
        SELECT es.*, u.first_name, u.last_name, c.name as campaign_name
        FROM email_sends es
        LEFT JOIN users u ON es.user_id = u.id
        LEFT JOIN email_campaigns c ON es.campaign_id = c.id
        WHERE 1=1
      `;
      
      const params = [];
      let paramCount = 1;

      if (campaign_id) {
        query += ` AND es.campaign_id = $${paramCount++}`;
        params.push(campaign_id);
      }

      if (user_id) {
        query += ` AND es.user_id = $${paramCount++}`;
        params.push(user_id);
      }

      if (status) {
        query += ` AND es.status = $${paramCount++}`;
        params.push(status);
      }

      query += ` ORDER BY es.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
      params.push(parseInt(limit), parseInt(offset));

      const result = await pool.query(query, params);
      
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      logger.error('Error getting email sends', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Initialize default templates and campaigns
  static async initializeDefaults(req, res) {
    try {
      await emailAutomationService.createDefaultTemplates();
      
      // Create default campaigns
      const campaigns = [
        {
          name: 'Welcome Series - Day 1',
          description: 'Welcome email sent immediately after signup',
          campaign_type: 'welcome_series',
          trigger_event: 'user_signup',
          delay_days: 0,
          target_criteria: { onboarding_completed: false }
        },
        {
          name: 'Framework Step Complete',
          description: 'Congratulatory email when user completes a framework step',
          campaign_type: 'milestone',
          trigger_event: 'framework_step_complete',
          delay_days: 0
        },
        {
          name: 'Debt Paid Off Celebration',
          description: 'Celebration email when user pays off a debt',
          campaign_type: 'milestone',
          trigger_event: 'debt_paid',
          delay_days: 0
        }
      ];

      for (const campaign of campaigns) {
        const query = `
          INSERT INTO email_campaigns (name, description, campaign_type, trigger_event, delay_days, target_criteria)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (name) DO NOTHING
        `;
        await pool.query(query, [
          campaign.name,
          campaign.description,
          campaign.campaign_type,
          campaign.trigger_event,
          campaign.delay_days,
          campaign.target_criteria ? JSON.stringify(campaign.target_criteria) : null
        ]);
      }

      logger.info('Default email automation setup completed');
      
      res.json({
        success: true,
        message: 'Default templates and campaigns initialized successfully'
      });
    } catch (error) {
      logger.error('Error initializing defaults', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = EmailAutomationController;
