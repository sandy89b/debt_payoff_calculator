const sgMail = require('@sendgrid/mail');
const { pool } = require('../config/database');
const logger = require('../utils/logger');
const smsService = require('./smsService');

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

class EmailAutomationService {
  constructor() {
    this.fromEmail = process.env.EMAIL_FROM || '23blastfan@gmail.com';
    this.fromName = process.env.EMAIL_FROM_NAME || 'Legacy Mindset Solutions';
  }

  // Template processing with variable substitution
  processTemplate(template, variables = {}) {
    let processedTemplate = { ...template };
    
    // Process subject
    processedTemplate.subject = this.substituteVariables(template.subject || '', variables);
    
    // Process HTML content
    processedTemplate.html_content = this.substituteVariables(template.html_content || '', variables);
    
    // Process text content
    processedTemplate.text_content = this.substituteVariables(template.text_content || '', variables);
    
    return processedTemplate;
  }

  // Variable substitution helper
  substituteVariables(content, variables) {
    if (!content || !variables) return content || '';
    
    let processed = content.toString();
    Object.keys(variables).forEach(key => {
      const placeholder = `{{${key}}}`;
      const value = variables[key] || '';
      processed = processed.replace(new RegExp(placeholder, 'g'), value);
    });
    
    return processed;
  }

  // Send email using SendGrid with deliverability best practices
  async sendEmail(to, subject, htmlContent, textContent = null) {
    if (!process.env.SENDGRID_API_KEY) {
      logger.devInfo(`Email would be sent to ${to}: ${subject}`);
      return { success: true, messageId: 'dev-mode' };
    }

    try {
      // Improve subject line to avoid spam triggers
      const improvedSubject = this.improveSubjectLine(subject);
      
      // Add proper headers and structure for better deliverability
      const msg = {
        to: {
          email: to,
          name: this.extractNameFromEmail(to)
        },
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        subject: improvedSubject,
        html: this.improveHtmlContent(htmlContent),
        text: textContent || this.stripHtml(htmlContent),
        // Add headers to improve deliverability
        headers: {
          'X-Mailer': 'Legacy Mindset Solutions v1.0',
          'X-Priority': '3',
          'X-MSMail-Priority': 'Normal',
          'Importance': 'Normal'
        },
        // Add categories for tracking
        categories: ['debt-freedom', 'automation'],
        // Add custom args for tracking
        customArgs: {
          environment: process.env.NODE_ENV || 'development',
          version: '1.0'
        },
        // Add tracking settings
        trackingSettings: {
          clickTracking: {
            enable: true,
            enableText: false
          },
          openTracking: {
            enable: true,
            substitutionTag: '%open-track%'
          },
          subscriptionTracking: {
            enable: false
          }
        },
        // Add mail settings
        mailSettings: {
          bypassListManagement: {
            enable: false
          },
          footer: {
            enable: true,
            text: 'Legacy Mindset Solutions - Your Journey to Financial Freedom',
            html: '<p style="font-size: 12px; color: #666; text-align: center;">Legacy Mindset Solutions - Your Journey to Financial Freedom</p>'
          },
          sandboxMode: {
            enable: process.env.NODE_ENV === 'development' && process.env.SENDGRID_SANDBOX === 'true'
          }
        }
      };

      const response = await sgMail.send(msg);
      logger.emailSent('automation', to);
      return { success: true, messageId: response[0].headers['x-message-id'] };
    } catch (error) {
      logger.emailError('automation', to, error);
      throw error;
    }
  }

  // Improve subject line to avoid spam triggers
  improveSubjectLine(subject) {
    // Remove excessive punctuation and spam trigger words
    let improved = subject
      .replace(/!{2,}/g, '!') // Reduce multiple exclamation marks
      .replace(/\?{2,}/g, '?') // Reduce multiple question marks
      .replace(/FREE/gi, 'Complimentary') // Replace "FREE" with "Complimentary"
      .replace(/URGENT/gi, 'Important') // Replace "URGENT" with "Important"
      .replace(/WINNER/gi, 'Selected') // Replace "WINNER" with "Selected"
      .replace(/CLICK HERE/gi, 'Learn More') // Replace "CLICK HERE" with "Learn More"
      .replace(/ACT NOW/gi, 'Take Action'); // Replace "ACT NOW" with "Take Action"
    
    // Ensure proper capitalization (avoid all caps)
    if (improved === improved.toUpperCase() && improved.length > 10) {
      improved = improved.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    }
    
    return improved;
  }

  // Extract name from email for personalization
  extractNameFromEmail(email) {
    const localPart = email.split('@')[0];
    // Convert email local part to a readable name
    return localPart
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  }

  // Improve HTML content for better deliverability
  improveHtmlContent(htmlContent) {
    if (!htmlContent) return htmlContent;
    
    // Add proper DOCTYPE and meta tags
    let improved = htmlContent;
    
    // If it's not a complete HTML document, wrap it properly
    if (!improved.includes('<!DOCTYPE') && !improved.includes('<html')) {
      improved = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <title>Legacy Mindset Solutions</title>
    <style>
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: #2d5a27; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        a { color: #2d5a27; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="margin: 0;">Legacy Mindset Solutions</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Your Journey to Financial Freedom</p>
        </div>
        <div class="content">
            ${improved}
        </div>
        <div class="footer">
            <p>This email was sent by Legacy Mindset Solutions</p>
            <p>If you no longer wish to receive these emails, please contact us.</p>
        </div>
    </div>
</body>
</html>`;
    }
    
    // Remove or replace spam trigger words in content
    improved = improved
      .replace(/\$\$\$/g, '$') // Reduce multiple dollar signs
      .replace(/FREE/gi, 'Complimentary')
      .replace(/GUARANTEED/gi, 'Assured')
      .replace(/NO RISK/gi, 'Risk-Free');
    
    return improved;
  }

  // Strip HTML tags for text version
  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  // Get email template by ID
  async getTemplate(templateId) {
    try {
      const query = 'SELECT * FROM email_templates WHERE id = $1 AND is_active = true';
      const result = await pool.query(query, [templateId]);
      return result.rows[0];
    } catch (error) {
      logger.error('Error getting email template', error.message);
      throw error;
    }
  }

  // Get email campaign by ID
  async getCampaign(campaignId) {
    try {
      const query = `
        SELECT c.*, t.html_content, t.text_content, t.variables
        FROM email_campaigns c
        LEFT JOIN email_templates t ON c.template_id = t.id
        WHERE c.id = $1 AND c.is_active = true
      `;
      const result = await pool.query(query, [campaignId]);
      return result.rows[0];
    } catch (error) {
      logger.error('Error getting email campaign', error.message);
      throw error;
    }
  }

  // Get user data for email personalization
  async getUserData(userId) {
    try {
      const query = `
        SELECT u.*, 
               COUNT(d.id) as debt_count,
               SUM(d.balance) as total_debt,
               MAX(ufp.completion_date) as last_framework_completion
        FROM users u
        LEFT JOIN debts d ON u.id = d.user_id AND d.is_active = true
        LEFT JOIN user_framework_progress ufp ON u.id = ufp.user_id AND ufp.is_completed = true
        WHERE u.id = $1
        GROUP BY u.id
      `;
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      logger.error('Error getting user data', error.message);
      throw error;
    }
  }

  // Check user email preferences
  async getUserEmailPreferences(userId) {
    try {
      const query = 'SELECT * FROM user_email_preferences WHERE user_id = $1';
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      logger.error('Error getting user email preferences', error.message);
      return null;
    }
  }

  // Record email send
  async recordEmailSend(userId, campaignId, templateId, recipientEmail, subject, htmlContent, textContent) {
    try {
      const query = `
        INSERT INTO email_sends (user_id, campaign_id, template_id, recipient_email, subject, html_content, text_content, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'sent')
        RETURNING id
      `;
      const result = await pool.query(query, [userId, campaignId, templateId, recipientEmail, subject, htmlContent, textContent]);
      return result.rows[0].id;
    } catch (error) {
      logger.error('Error recording email send', error.message);
      throw error;
    }
  }

  // Update email send status
  async updateEmailSendStatus(sendId, status, additionalData = {}) {
    try {
      const updates = [];
      const values = [];
      let paramCount = 1;

      updates.push(`status = $${paramCount++}`);
      values.push(status);

      if (status === 'sent') {
        updates.push(`sent_at = CURRENT_TIMESTAMP`);
      } else if (status === 'delivered') {
        updates.push(`delivered_at = CURRENT_TIMESTAMP`);
      } else if (status === 'opened') {
        updates.push(`opened_at = CURRENT_TIMESTAMP`);
        updates.push(`open_count = open_count + 1`);
      } else if (status === 'clicked') {
        updates.push(`clicked_at = CURRENT_TIMESTAMP`);
        updates.push(`click_count = click_count + 1`);
      } else if (status === 'bounced') {
        updates.push(`bounce_reason = $${paramCount++}`);
        values.push(additionalData.bounce_reason || 'Unknown');
      }

      values.push(sendId);

      const query = `
        UPDATE email_sends 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
      `;
      
      await pool.query(query, values);
    } catch (error) {
      logger.error('Error updating email send status', error.message);
      throw error;
    }
  }

  // Send campaign email to user
  async sendCampaignEmail(campaignId, userId, customVariables = {}) {
    try {
      // Get campaign and template
      const campaign = await this.getCampaign(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found or inactive');
      }

      // Get user data
      const userData = await this.getUserData(userId);
      if (!userData) {
        throw new Error('User not found');
      }

      // Check email preferences
      const preferences = await this.getUserEmailPreferences(userId);
      if (preferences && preferences.unsubscribed_at) {
        logger.info('User has unsubscribed from emails', { userId, email: userData.email });
        return { success: false, reason: 'unsubscribed' };
      }

      // Prepare variables
      const variables = {
        firstName: userData.first_name,
        lastName: userData.last_name,
        email: userData.email,
        debtCount: userData.debt_count || 0,
        totalDebt: userData.total_debt || 0,
        ...customVariables
      };

      // Process template
      const processedTemplate = this.processTemplate(campaign, variables);

      // Send email
      const emailResult = await this.sendEmail(
        userData.email,
        processedTemplate.subject,
        processedTemplate.html_content,
        processedTemplate.text_content
      );

      if (emailResult.success) {
        // Record the send
        await this.recordEmailSend(
          userId,
          campaignId,
          campaign.template_id,
          userData.email,
          processedTemplate.subject,
          processedTemplate.html_content,
          processedTemplate.text_content
        );

        logger.info('Campaign email sent successfully', { 
          campaignId, 
          userId, 
          email: userData.email 
        });
      }

      return emailResult;
    } catch (error) {
      logger.error('Error sending campaign email', error.message);
      throw error;
    }
  }

  // Trigger campaigns by event (simplified version for direct campaign triggering)
  async triggerCampaignByEvent(triggerEvent, userId, eventData = {}) {
    try {
      // Get active campaigns for this trigger event
      const query = `
        SELECT c.*, t.html_content, t.text_content, t.subject, t.variables
        FROM email_campaigns c
        LEFT JOIN email_templates t ON c.template_id = t.id
        WHERE c.trigger_event = $1 AND c.is_active = true
      `;
      const result = await pool.query(query, [triggerEvent]);

      for (const campaign of result.rows) {
        try {
          // Check if campaign has a template
          if (!campaign.template_id) {
            logger.warn('Campaign has no template assigned', { campaignId: campaign.id, triggerEvent });
            continue;
          }

          // Check if user meets target criteria
          if (campaign.target_criteria) {
            const userData = await this.getUserData(userId);
            // Handle both JSON string and object formats
            let criteria = campaign.target_criteria;
            if (typeof criteria === 'string') {
              try {
                criteria = JSON.parse(criteria);
              } catch (error) {
                logger.error('Invalid JSON in target_criteria', { campaignId: campaign.id, criteria });
                continue;
              }
            }
            if (!this.matchesTargetCriteria(userData, criteria)) {
              logger.info('User does not meet campaign criteria', { campaignId: campaign.id, userId });
              continue;
            }
          }

          // Get user data for template variables
          const userData = await this.getUserData(userId);
          const templateVariables = {
            firstName: userData.first_name || eventData.firstName,
            lastName: userData.last_name || eventData.lastName,
            email: userData.email || eventData.email,
            ...eventData
          };

          // Process template with variables
          const processedTemplate = this.processTemplate({
            subject: campaign.subject,
            html_content: campaign.html_content,
            text_content: campaign.text_content
          }, templateVariables);

          // Send email
          await this.sendEmail(
            userData.email || eventData.email,
            processedTemplate.subject,
            processedTemplate.html_content,
            processedTemplate.text_content
          );

          // Record the email send
          await this.recordEmailSend(
            userId,
            campaign.id,
            campaign.template_id,
            userData.email || eventData.email,
            processedTemplate.subject,
            processedTemplate.html_content,
            processedTemplate.text_content
          );
          
          logger.info('Campaign triggered successfully', { 
            triggerEvent, 
            userId, 
            campaignId: campaign.id,
            campaignName: campaign.name
          });
        } catch (error) {
          logger.error('Error in campaign execution', error.message);
        }
      }
    } catch (error) {
      logger.error('Error triggering campaign by event', error.message);
      throw error;
    }
  }

  // Trigger workflow based on event (legacy method)
  async triggerWorkflow(triggerEvent, userId, eventData = {}) {
    try {
      // Get active workflows for this trigger
      const query = `
        SELECT w.*, c.*, t.html_content, t.text_content, t.variables
        FROM email_workflows w
        JOIN email_campaigns c ON c.id = ANY(
          SELECT jsonb_array_elements_text(w.workflow_steps)::int
        )
        LEFT JOIN email_templates t ON c.template_id = t.id
        WHERE w.trigger_event = $1 AND w.is_active = true
      `;
      const result = await pool.query(query, [triggerEvent]);

      for (const workflow of result.rows) {
        try {
          // Check if user meets target criteria
          if (workflow.target_criteria) {
            const userData = await this.getUserData(userId);
            if (!this.matchesTargetCriteria(userData, workflow.target_criteria)) {
              continue;
            }
          }

          // Send campaign email
          await this.sendCampaignEmail(workflow.id, userId, eventData);
          
          logger.info('Workflow triggered successfully', { 
            triggerEvent, 
            userId, 
            workflowId: workflow.id 
          });
        } catch (error) {
          logger.error('Error in workflow execution', error.message);
        }
      }
    } catch (error) {
      logger.error('Error triggering workflow', error.message);
      throw error;
    }
  }

  // Get user data for template processing
  async getUserData(userId) {
    try {
      const query = `
        SELECT id, first_name, last_name, email, phone, created_at
        FROM users 
        WHERE id = $1
      `;
      const result = await pool.query(query, [userId]);
      
      if (result.rows.length === 0) {
        throw new Error(`User not found: ${userId}`);
      }
      
      return result.rows[0];
    } catch (error) {
      logger.error('Error getting user data', error.message);
      throw error;
    }
  }

  // Generate tracking pixel HTML
  generateTrackingPixel(emailSendId) {
    const trackingId = `${emailSendId}-${Date.now()}`;
    const trackingUrl = `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/tracking/open/${trackingId}`;
    
    return `<img src="${trackingUrl}" width="1" height="1" border="0" style="display:none !important; visibility:hidden !important; opacity:0 !important;" alt="" />`;
  }

  // Add tracking pixel to HTML content
  addTrackingPixel(htmlContent, emailSendId) {
    if (!htmlContent || !emailSendId) return htmlContent;
    
    const trackingPixel = this.generateTrackingPixel(emailSendId);
    
    // Try to add before closing body tag, otherwise at the end
    if (htmlContent.includes('</body>')) {
      return htmlContent.replace('</body>', `${trackingPixel}</body>`);
    } else {
      return `${htmlContent}${trackingPixel}`;
    }
  }

  // Record email send for tracking
  async recordEmailSend(userId, campaignId, templateId, recipientEmail, subject, htmlContent, textContent) {
    try {
      const query = `
        INSERT INTO email_sends (
          user_id, campaign_id, template_id, recipient_email, subject, 
          html_content, text_content, status, sent_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'sent', NOW())
        RETURNING id
      `;
      
      const result = await pool.query(query, [
        userId, campaignId, templateId, recipientEmail, subject, htmlContent, textContent
      ]);
      
      const emailSendId = result.rows[0].id;
      
      // Add tracking pixel to HTML content and update the record
      if (htmlContent) {
        const htmlWithTracking = this.addTrackingPixel(htmlContent, emailSendId);
        
        const updateQuery = `
          UPDATE email_sends 
          SET html_content = $1 
          WHERE id = $2
        `;
        
        await pool.query(updateQuery, [htmlWithTracking, emailSendId]);
      }
      
      return emailSendId;
    } catch (error) {
      logger.error('Error recording email send', error.message);
      // Don't throw error - we don't want to fail email sending if recording fails
    }
  }

  // Check if user matches target criteria
  matchesTargetCriteria(userData, criteria) {
    try {
      for (const [key, value] of Object.entries(criteria)) {
        if (userData[key] !== value) {
          return false;
        }
      }
      return true;
    } catch (error) {
      logger.error('Error checking target criteria', error.message);
      return false;
    }
  }

  // Get email analytics
  async getEmailAnalytics(campaignId = null, dateRange = 30) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_sends,
          COUNT(CASE WHEN status IN ('sent', 'opened', 'clicked') THEN 1 END) as sent_count,
          COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_count,
          COUNT(CASE WHEN first_opened_at IS NOT NULL THEN 1 END) as opened_count,
          COUNT(CASE WHEN status = 'clicked' THEN 1 END) as clicked_count,
          COUNT(CASE WHEN status = 'bounced' THEN 1 END) as bounced_count,
          AVG(COALESCE(open_count, 0)) as avg_opens,
          AVG(COALESCE(click_count, 0)) as avg_clicks
        FROM email_sends
        WHERE sent_at >= CURRENT_DATE - INTERVAL '${dateRange} days'
      `;
      
      const params = [];
      if (campaignId) {
        query += ' AND campaign_id = $1';
        params.push(campaignId);
      }

      const result = await pool.query(query, params);
      const analytics = result.rows[0];

      // Calculate rates
      analytics.open_rate = analytics.sent_count > 0 ? 
        (analytics.opened_count / analytics.sent_count * 100).toFixed(2) : 0;
      analytics.click_rate = analytics.sent_count > 0 ? 
        (analytics.clicked_count / analytics.sent_count * 100).toFixed(2) : 0;
      analytics.bounce_rate = analytics.sent_count > 0 ? 
        (analytics.bounced_count / analytics.sent_count * 100).toFixed(2) : 0;

      return analytics;
    } catch (error) {
      logger.error('Error getting email analytics', error.message);
      throw error;
    }
  }

  // Create default email templates
  async createDefaultTemplates() {
    try {
      const templates = [
        {
          name: 'Welcome Email',
          subject: 'Welcome to Your Debt Freedom Journey! 🎉',
          html_content: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2d5a27;">Welcome to Legacy Mindset Solutions!</h2>
              <p>Dear {{firstName}},</p>
              <p>Welcome to your debt freedom journey! We're excited to have you join our community of believers committed to financial stewardship and freedom.</p>
              <div style="background-color: #f0f8f0; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3 style="color: #2d5a27;">Your Next Steps:</h3>
                <ul>
                  <li>Complete your debt inventory</li>
                  <li>Set up your payment calendar</li>
                  <li>Begin the Widow's Wealth Cycle™ framework</li>
                </ul>
              </div>
              <p>Remember: "Faith without works is dead" - James 2:17. Your journey to financial freedom starts with taking that first step!</p>
              <p>Blessings,<br>The Legacy Mindset Solutions Team</p>
            </div>
          `,
          text_content: 'Welcome to Legacy Mindset Solutions! Dear {{firstName}}, Welcome to your debt freedom journey! Your next steps: Complete your debt inventory, Set up your payment calendar, Begin the Widow\'s Wealth Cycle framework. Remember: Faith without works is dead - James 2:17. Blessings, The Legacy Mindset Solutions Team',
          template_type: 'welcome',
          category: 'debt_freedom',
          variables: JSON.stringify(['firstName', 'lastName', 'email'])
        },
        {
          name: 'Framework Step Complete',
          subject: 'Congratulations! You\'ve Completed {{stepTitle}} 🏆',
          html_content: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2d5a27;">Congratulations, {{firstName}}!</h2>
              <p>You've successfully completed the <strong>{{stepTitle}}</strong> step of the Widow's Wealth Cycle™!</p>
              <div style="background-color: #f0f8f0; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3 style="color: #2d5a27;">What's Next:</h3>
                <p>{{nextStepInstructions}}</p>
              </div>
              <p>Keep pressing forward! Each step brings you closer to financial freedom and the ability to be a blessing to others.</p>
              <p>Blessings,<br>The Legacy Mindset Solutions Team</p>
            </div>
          `,
          text_content: 'Congratulations {{firstName}}! You\'ve completed {{stepTitle}} step. What\'s next: {{nextStepInstructions}}. Keep pressing forward! Blessings, The Legacy Mindset Solutions Team',
          template_type: 'milestone',
          category: 'framework',
          variables: JSON.stringify(['firstName', 'stepTitle', 'nextStepInstructions'])
        },
        {
          name: 'Debt Paid Off',
          subject: '🎉 Debt Freedom Milestone: {{debtName}} Paid Off!',
          html_content: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2d5a27;">Amazing Achievement, {{firstName}}!</h2>
              <p>Congratulations on paying off <strong>{{debtName}}</strong>! This is a significant milestone in your debt freedom journey.</p>
              <div style="background-color: #f0f8f0; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3 style="color: #2d5a27;">You've Saved:</h3>
                <ul>
                  <li>${{interestSaved}} in interest</li>
                  <li>{{monthsSaved}} months of payments</li>
                </ul>
              </div>
              <p>Keep up the momentum! You're building wealth and creating a legacy of financial stewardship.</p>
              <p>Blessings,<br>The Legacy Mindset Solutions Team</p>
            </div>
          `,
          text_content: 'Congratulations {{firstName}}! You\'ve paid off {{debtName}}! You\'ve saved ${{interestSaved}} in interest and {{monthsSaved}} months of payments. Keep up the momentum! Blessings, The Legacy Mindset Solutions Team',
          template_type: 'milestone',
          category: 'debt_freedom',
          variables: JSON.stringify(['firstName', 'debtName', 'interestSaved', 'monthsSaved'])
        }
      ];

      for (const template of templates) {
        const query = `
          INSERT INTO email_templates (name, subject, html_content, text_content, template_type, category, variables)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (name) DO NOTHING
        `;
        await pool.query(query, [
          template.name,
          template.subject,
          template.html_content,
          template.text_content,
          template.template_type,
          template.category,
          template.variables
        ]);
      }

      logger.info('Default email templates created successfully');
    } catch (error) {
      logger.error('Error creating default templates', error.message);
      throw error;
    }
  }

  // ==================== MILESTONE EMAIL TRIGGERS ====================

  // Trigger debt progress milestone emails
  async triggerDebtMilestone(userId, milestoneData) {
    const { milestoneType, debtName, amount, percentage, totalDebt, remainingDebt } = milestoneData;
    
    let triggerEvent = '';
    let eventData = {
      debtName: debtName || 'your debt',
      amount: this.formatCurrency(amount || 0),
      percentage: percentage || 0,
      totalDebt: this.formatCurrency(totalDebt || 0),
      remainingDebt: this.formatCurrency(remainingDebt || 0),
      celebrationLevel: this.getCelebrationLevel(percentage || 0)
    };

    switch (milestoneType) {
      case 'first_debt_paid':
        triggerEvent = 'first_debt_paid';
        eventData.encouragementMessage = "You've proven you can do this! Keep the momentum going.";
        break;
      case 'debt_milestone_25':
        triggerEvent = 'debt_milestone_25';
        eventData.encouragementMessage = "You're 1/4 of the way to freedom! Amazing progress.";
        break;
      case 'debt_milestone_50':
        triggerEvent = 'debt_milestone_50';
        eventData.encouragementMessage = "Halfway there! You're unstoppable now.";
        break;
      case 'debt_milestone_75':
        triggerEvent = 'debt_milestone_75';
        eventData.encouragementMessage = "So close to freedom! The finish line is in sight.";
        break;
      case 'debt_free':
        triggerEvent = 'debt_free';
        eventData.encouragementMessage = "DEBT FREE! You did it! Time to build your legacy.";
        break;
      default:
        logger.warn(`Unknown debt milestone type: ${milestoneType}`);
        return;
    }

    // Send email campaign
    await this.triggerCampaignByEvent(triggerEvent, userId, eventData);
    
    // Also send SMS notification if user has phone number and SMS is enabled
    await this.sendDebtMilestoneSMS(userId, milestoneType, debtName, percentage);
  }

  // Trigger framework step completion emails
  async triggerFrameworkStep(userId, stepData) {
    const { stepNumber, stepTitle, isComplete, allStepsComplete } = stepData;
    
    if (allStepsComplete) {
      await this.triggerCampaignByEvent('framework_complete', userId, {
        achievement: 'All 6 Framework Steps Complete',
        nextPhase: 'Legacy Building',
        completionBonus: 'You\'ve mastered the Widow\'s Wealth Cycle!'
      });
    } else if (isComplete) {
      const nextStep = stepNumber < 6 ? stepNumber + 1 : null;
      await this.triggerCampaignByEvent('framework_step_complete', userId, {
        stepNumber,
        stepTitle,
        nextStepNumber: nextStep,
        nextStepTitle: this.getFrameworkStepTitle(nextStep),
        progressPercentage: Math.round((stepNumber / 6) * 100)
      });
    }
  }

  // ==================== ENGAGEMENT EMAIL TRIGGERS ====================

  // Trigger first debt entry welcome
  async triggerFirstDebtEntry(userId, debtData) {
    const { debtCount, totalDebt } = debtData;
    
    await this.triggerCampaignByEvent('first_debt_entry', userId, {
      debtCount,
      totalDebt: this.formatCurrency(totalDebt),
      encouragement: debtCount === 1 ? 
        "Every journey begins with a single step. You've taken yours!" :
        `You've listed ${debtCount} debts. Awareness is the first step to freedom!`,
      nextStep: 'Use our calculator to create your payoff strategy'
    });
  }

  // Trigger calculator usage follow-up
  async triggerCalculatorUsed(userId, calculatorData) {
    const { strategy, monthsToPayoff, totalInterest, extraPayment } = calculatorData;
    
    await this.triggerCampaignByEvent('calculator_used', userId, {
      strategy: strategy || 'Debt Snowball',
      monthsToPayoff: monthsToPayoff || 'N/A',
      totalInterest: this.formatCurrency(totalInterest || 0),
      extraPayment: this.formatCurrency(extraPayment || 0),
      savings: totalInterest > 0 ? `You could save ${this.formatCurrency(totalInterest)} in interest!` : '',
      actionItem: 'Export your plan to PDF and start your debt-free journey!'
    });
  }

  // Trigger user inactivity emails
  async triggerUserInactivity(userId, inactivityData) {
    const { daysSinceLastLogin, lastActivity } = inactivityData;
    
    if (daysSinceLastLogin >= 30) {
      await this.triggerCampaignByEvent('user_inactive_30_days', userId, {
        daysSinceLastLogin,
        lastActivity,
        winBackOffer: 'Special: Free 30-minute debt strategy consultation',
        motivationalQuote: '"The best time to plant a tree was 20 years ago. The second best time is now." - Chinese Proverb'
      });
    } else if (daysSinceLastLogin >= 7) {
      await this.triggerCampaignByEvent('user_inactive_7_days', userId, {
        daysSinceLastLogin,
        lastActivity,
        encouragement: 'Your debt freedom journey is waiting for you!',
        quickWin: 'Just 5 minutes today can restart your momentum'
      });
    }
  }

  // ==================== BEHAVIORAL EMAIL TRIGGERS ====================

  // Trigger goal creation confirmation
  async triggerGoalCreated(userId, goalData) {
    const { goalType, goalAmount, targetDate, goalName } = goalData;
    
    await this.triggerCampaignByEvent('goal_created', userId, {
      goalType,
      goalName,
      goalAmount: this.formatCurrency(goalAmount),
      targetDate: this.formatDate(targetDate),
      encouragement: 'Goals are dreams with deadlines. You\'ve just made yours real!',
      trackingTip: 'Check your progress weekly to stay motivated'
    });
  }

  // Trigger PDF export follow-up
  async triggerPdfExported(userId, exportData) {
    const { exportType, fileName } = exportData;
    
    await this.triggerCampaignByEvent('pdf_exported', userId, {
      exportType,
      fileName,
      nextStep: exportType === 'debt_plan' ? 
        'Share your plan with your accountability partner' :
        'Review your plan weekly and celebrate small wins',
      additionalResource: 'Download our free debt tracking worksheet'
    });
  }

  // ==================== SCHEDULED EMAIL CAMPAIGNS ====================

  // Trigger weekly check-in emails
  async triggerWeeklyCheckIn(userId, progressData) {
    const { weeklyProgress, totalProgress, motivationalMessage } = progressData;
    
    await this.triggerCampaignByEvent('weekly_check_in', userId, {
      weeklyProgress: weeklyProgress || 'Keep going!',
      totalProgress: totalProgress || 'Every step counts',
      motivationalMessage: motivationalMessage || 'You\'re doing great!',
      weeklyTip: this.getWeeklyTip(),
      biblicalVerse: this.getWeeklyVerse()
    });
  }

  // Trigger monthly progress report
  async triggerMonthlyReport(userId, monthlyData) {
    const { debtPaid, interestSaved, milestonesReached, frameworkProgress } = monthlyData;
    
    await this.triggerCampaignByEvent('monthly_report', userId, {
      debtPaid: this.formatCurrency(debtPaid || 0),
      interestSaved: this.formatCurrency(interestSaved || 0),
      milestonesReached: milestonesReached || 0,
      frameworkProgress: `${frameworkProgress || 0}% complete`,
      monthlyHighlight: this.getMonthlyHighlight(monthlyData),
      nextMonthGoal: 'Continue building momentum!'
    });
  }

  // ==================== UTILITY METHODS ====================

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  }

  formatDate(date) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getCelebrationLevel(percentage) {
    if (percentage >= 75) return 'AMAZING';
    if (percentage >= 50) return 'FANTASTIC';
    if (percentage >= 25) return 'GREAT';
    return 'GOOD';
  }

  getFrameworkStepTitle(stepNumber) {
    const steps = {
      1: 'INVENTORY - What\'s In Your House?',
      2: 'INSTRUCTION - Borrow With Purpose',
      3: 'IMPLEMENTATION - Shut the Door and Pour',
      4: 'INCREASE - Let It Flow Until It Stops',
      5: 'INCOME - Sell the Oil',
      6: 'IMPACT - Pay Your Debts and Live'
    };
    return steps[stepNumber] || 'Complete';
  }

  getWeeklyTip() {
    const tips = [
      'Review your budget every Sunday to stay on track',
      'Celebrate small wins - they add up to big victories',
      'Find an accountability partner for your debt journey',
      'Use the envelope method for discretionary spending',
      'Automate your debt payments to avoid temptation'
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  }

  getWeeklyVerse() {
    const verses = [
      '"The plans of the diligent lead to profit as surely as haste leads to poverty." - Proverbs 21:5',
      '"She considers a field and buys it; out of her earnings she plants a vineyard." - Proverbs 31:16',
      '"Commit to the Lord whatever you do, and he will establish your plans." - Proverbs 16:3',
      '"The blessing of the Lord brings wealth, without painful toil for it." - Proverbs 10:22'
    ];
    return verses[Math.floor(Math.random() * verses.length)];
  }

  getMonthlyHighlight(data) {
    if (data.debtPaid > 1000) return `Outstanding! You paid off ${this.formatCurrency(data.debtPaid)} this month!`;
    if (data.milestonesReached > 0) return `You reached ${data.milestonesReached} milestone(s) this month!`;
    if (data.frameworkProgress > 0) return `Great progress on the framework - ${data.frameworkProgress}% complete!`;
    return 'Keep building momentum - every step forward counts!';
  }

  // ==================== SMS NOTIFICATION METHODS ====================

  // Send SMS notification for debt milestones
  async sendDebtMilestoneSMS(userId, milestoneType, debtName, percentage) {
    try {
      // Get user data including phone number
      const userData = await this.getUserData(userId);
      if (!userData || !userData.phone) {
        logger.info(`No phone number for user ${userId}, skipping SMS notification`);
        return;
      }

      // Check if SMS service is enabled
      const smsStatus = smsService.getStatus();
      if (!smsStatus.isEnabled) {
        logger.info('SMS service not enabled, skipping SMS notification');
        return;
      }

      // Send SMS via SMS service
      const result = await smsService.sendDebtMilestoneSMS(
        userData.phone, 
        debtName, 
        milestoneType, 
        percentage
      );

      if (result.success) {
        logger.info('Debt milestone SMS sent successfully', {
          userId,
          phone: userData.phone,
          milestoneType,
          messageId: result.messageId
        });
      } else {
        logger.error('Failed to send debt milestone SMS', {
          userId,
          phone: userData.phone,
          error: result.error
        });
      }

      return result;

    } catch (error) {
      logger.error('Error sending debt milestone SMS', {
        userId,
        milestoneType,
        error: error.message
      });
      return { success: false, error: error.message };
    }
  }

  // Send SMS notification for debt payoff reminders
  async sendDebtPayoffReminderSMS(userId, debtName, amount) {
    try {
      const userData = await this.getUserData(userId);
      if (!userData || !userData.phone) {
        logger.info(`No phone number for user ${userId}, skipping payoff reminder SMS`);
        return;
      }

      const smsStatus = smsService.getStatus();
      if (!smsStatus.isEnabled) {
        logger.info('SMS service not enabled, skipping payoff reminder SMS');
        return;
      }

      const result = await smsService.sendDebtPayoffReminder(
        userData.phone,
        debtName,
        this.formatCurrency(amount)
      );

      if (result.success) {
        logger.info('Debt payoff reminder SMS sent successfully', {
          userId,
          phone: userData.phone,
          debtName,
          messageId: result.messageId
        });
      }

      return result;

    } catch (error) {
      logger.error('Error sending debt payoff reminder SMS', {
        userId,
        debtName,
        error: error.message
      });
      return { success: false, error: error.message };
    }
  }

  // Send motivational SMS
  async sendMotivationalSMS(userId) {
    try {
      const userData = await this.getUserData(userId);
      if (!userData || !userData.phone) {
        logger.info(`No phone number for user ${userId}, skipping motivational SMS`);
        return;
      }

      const smsStatus = smsService.getStatus();
      if (!smsStatus.isEnabled) {
        logger.info('SMS service not enabled, skipping motivational SMS');
        return;
      }

      const result = await smsService.sendMotivationalSMS(
        userData.phone,
        userData.name || userData.email.split('@')[0]
      );

      if (result.success) {
        logger.info('Motivational SMS sent successfully', {
          userId,
          phone: userData.phone,
          messageId: result.messageId
        });
      }

      return result;

    } catch (error) {
      logger.error('Error sending motivational SMS', {
        userId,
        error: error.message
      });
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailAutomationService();
