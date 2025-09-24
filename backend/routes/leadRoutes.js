const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/adminAuth');
const LeadAdmin = require('../controllers/leadController');
const Lead = require('../models/Lead');
const { authenticateToken } = require('../middleware/auth');
const emailAutomationService = require('../services/emailAutomationService');
const logger = require('../utils/logger');

// =============================================
// PUBLIC LEAD CAPTURE ROUTES
// =============================================

// Create a new lead (public endpoint)
router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      totalDebt,
      totalMinPayments,
      extraPayment,
      debtCount,
      calculationResults,
      source = 'debt_calculator'
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, and email are required'
      });
    }

    // Check if lead already exists
    const existingLead = await Lead.findByEmail(email);
    if (existingLead) {
      return res.status(409).json({
        success: false,
        message: 'Lead with this email already exists',
        data: { leadId: existingLead.id }
      });
    }

    const lead = await Lead.create({
      firstName,
      lastName,
      email,
      phone,
      totalDebt: parseFloat(totalDebt || 0),
      totalMinPayments: parseFloat(totalMinPayments || 0),
      extraPayment: parseFloat(extraPayment || 0),
      debtCount: parseInt(debtCount || 0),
      calculationResults,
      source
    });

      logger.info('Lead captured successfully', {
        leadId: lead.id,
        email: lead.email,
        source: lead.source
      });

      // Trigger welcome email
      try {
        await emailAutomationService.sendLeadEmail(lead.id, 'lead_captured', {
          firstName: lead.firstName,
          totalDebt: `$${lead.totalDebt.toLocaleString()}`,
          debtCount: lead.debtCount,
          totalMinPayments: `$${lead.totalMinPayments.toLocaleString()}`,
          extraPayment: `$${lead.extraPayment.toLocaleString()}`,
          encouragementMessage: getEncouragementMessage(lead),
          platformUrl: process.env.FRONTEND_URL || 'http://localhost:8080'
        });
      } catch (emailError) {
        logger.error('Error sending welcome email to lead:', emailError);
        // Don't fail the lead capture if email fails
      }

      res.status(201).json({
        success: true,
        message: 'Lead captured successfully',
        data: lead.toJSON()
      });

  } catch (error) {
    logger.error('Error capturing lead', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to capture lead',
      error: error.message
    });
  }
});

// =============================================
// PROTECTED LEAD MANAGEMENT ROUTES
// =============================================

// Apply authentication to all routes below
router.use(authenticateToken);
// Admin: create lead and send password setup email
router.post('/admin/create', verifyAdmin, LeadAdmin.adminCreateLead);

// Get all leads (admin only)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { limit = 50, offset = 0, status } = req.query;
    
    const leads = await Lead.findAll(
      parseInt(limit),
      parseInt(offset),
      status
    );

    res.json({
      success: true,
      data: leads.map(lead => lead.toJSON())
    });

  } catch (error) {
    logger.error('Error fetching leads', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leads',
      error: error.message
    });
  }
});

// Get lead statistics (admin only)
router.get('/statistics', verifyAdmin, async (req, res) => {
  try {
    const stats = await Lead.getStatistics();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Error fetching lead statistics', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lead statistics',
      error: error.message
    });
  }
});

// Convert lead to user (with optional debt transfer)
router.post('/:leadId/convert', async (req, res) => {
  try {
    const { leadId } = req.params;
    const userId = req.user.id;
    const { debts } = req.body; // Optional debt data to transfer

    const lead = await Lead.convertToUser(leadId, userId);

    let debtTransferResult = null;
    
    // If debt data is provided, transfer it
    if (debts && Array.isArray(debts) && debts.length > 0) {
      try {
        const EnhancedDebt = require('../models/EnhancedDebt');
        const createdDebts = [];
        const errors = [];
        
        for (let i = 0; i < debts.length; i++) {
          try {
            const debtData = debts[i];
            // Map frontend property names to backend property names
            const backendData = {
              name: debtData.name,
              balance: debtData.balance,
              interestRate: debtData.interestRate,
              minimumPayment: debtData.minPayment,
              dueDate: debtData.dueDate,
              debtType: debtData.debtType,
              description: debtData.description || ''
            };
            
            const debt = await EnhancedDebt.create(userId, backendData);
            createdDebts.push(debt.toJSON());
          } catch (error) {
            errors.push({
              index: i,
              data: debts[i],
              error: error.message
            });
          }
        }
        
        debtTransferResult = {
          created: createdDebts,
          errors: errors,
          summary: {
            total: debts.length,
            created: createdDebts.length,
            failed: errors.length
          }
        };
        
        logger.info('Debt data transferred during lead conversion', { 
          userId, 
          transferredCount: createdDebts.length,
          errorCount: errors.length 
        });
      } catch (debtError) {
        logger.error('Error transferring debt data during lead conversion', debtError.message);
        debtTransferResult = { error: debtError.message };
      }
    }

    logger.info('Lead converted to user', {
      leadId,
      userId,
      email: lead.email,
      debtTransfer: debtTransferResult ? 'completed' : 'skipped'
    });

    res.json({
      success: true,
      message: 'Lead converted to user successfully',
      data: {
        lead: lead.toJSON(),
        debtTransfer: debtTransferResult
      }
    });

  } catch (error) {
    logger.error('Error converting lead to user', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to convert lead to user',
      error: error.message
    });
  }
});

// Update lead status
router.put('/:leadId/status', verifyAdmin, async (req, res) => {
  try {
    const { leadId } = req.params;
    const { status } = req.body;

    if (!status || !['new', 'nurturing', 'converted', 'lost'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: new, nurturing, converted, lost'
      });
    }

    const lead = await Lead.updateStatus(leadId, status);

    res.json({
      success: true,
      message: 'Lead status updated successfully',
      data: lead.toJSON()
    });

  } catch (error) {
    logger.error('Error updating lead status', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update lead status',
      error: error.message
    });
  }
});

// Get lead by ID
router.get('/:leadId', verifyAdmin, async (req, res) => {
  try {
    const { leadId } = req.params;

    // This would need a findById method in the Lead model
    // For now, we'll return a placeholder
    res.status(501).json({
      success: false,
      message: 'Get lead by ID not implemented yet'
    });

  } catch (error) {
    logger.error('Error fetching lead by ID', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lead',
      error: error.message
    });
  }
});

// Get email analytics
router.get('/email-analytics', verifyAdmin, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const query = `
      SELECT 
        COUNT(*) as total_emails_sent,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as emails_delivered,
        COUNT(CASE WHEN status = 'opened' THEN 1 END) as emails_opened,
        COUNT(CASE WHEN status = 'clicked' THEN 1 END) as emails_clicked,
        COUNT(CASE WHEN status = 'bounced' THEN 1 END) as emails_bounced,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as emails_failed
      FROM lead_email_log
      WHERE sent_at >= NOW() - INTERVAL '${parseInt(days)} days'
    `;

    const result = await pool.query(query);
    const stats = result.rows[0];

    const totalSent = parseInt(stats.total_emails_sent);
    const delivered = parseInt(stats.emails_delivered);
    const opened = parseInt(stats.emails_opened);
    const clicked = parseInt(stats.emails_clicked);
    const bounced = parseInt(stats.emails_bounced);
    const failed = parseInt(stats.emails_failed);

    const analytics = {
      totalEmailsSent: totalSent,
      emailsDelivered: delivered,
      emailsOpened: opened,
      emailsClicked: clicked,
      emailsBounced: bounced,
      emailsFailed: failed,
      openRate: totalSent > 0 ? (opened / totalSent) * 100 : 0,
      clickRate: totalSent > 0 ? (clicked / totalSent) * 100 : 0,
      bounceRate: totalSent > 0 ? (bounced / totalSent) * 100 : 0,
      conversionRate: 0 // This would need to be calculated based on lead conversions
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    logger.error('Error fetching email analytics', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch email analytics',
      error: error.message
    });
  }
});

// Get email logs
router.get('/email-logs', verifyAdmin, async (req, res) => {
  try {
    const { days = 30, status } = req.query;
    
    let query = `
      SELECT 
        lel.*,
        l.first_name,
        l.last_name
      FROM lead_email_log lel
      JOIN leads l ON lel.lead_id = l.id
      WHERE lel.sent_at >= NOW() - INTERVAL '${parseInt(days)} days'
    `;
    
    const values = [];
    if (status && status !== 'all') {
      query += ' AND lel.status = $1';
      values.push(status);
    }
    
    query += ' ORDER BY lel.sent_at DESC LIMIT 100';

    const result = await pool.query(query, values);
    
    const emailLogs = result.rows.map(row => ({
      id: row.id,
      leadId: row.lead_id,
      triggerEvent: row.trigger_event,
      emailAddress: row.email_address,
      status: row.status,
      sentAt: row.sent_at,
      errorMessage: row.error_message,
      leadName: `${row.first_name} ${row.last_name}`
    }));

    res.json({
      success: true,
      data: emailLogs
    });

  } catch (error) {
    logger.error('Error fetching email logs', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch email logs',
      error: error.message
    });
  }
});

// Get lead email stats
router.get('/lead-email-stats', verifyAdmin, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const query = `
      SELECT 
        l.id as lead_id,
        CONCAT(l.first_name, ' ', l.last_name) as lead_name,
        l.email as lead_email,
        COUNT(lel.id) as total_emails_sent,
        MAX(lel.sent_at) as last_email_sent,
        (
          SELECT lel2.status 
          FROM lead_email_log lel2 
          WHERE lel2.lead_id = l.id 
          ORDER BY lel2.sent_at DESC 
          LIMIT 1
        ) as last_email_status,
        l.status as conversion_status
      FROM leads l
      LEFT JOIN lead_email_log lel ON l.id = lel.lead_id 
        AND lel.sent_at >= NOW() - INTERVAL '${parseInt(days)} days'
      WHERE l.created_at >= NOW() - INTERVAL '${parseInt(days)} days'
      GROUP BY l.id, l.first_name, l.last_name, l.email, l.status
      ORDER BY total_emails_sent DESC, last_email_sent DESC
    `;

    const result = await pool.query(query);
    
    const leadStats = result.rows.map(row => ({
      leadId: row.lead_id,
      leadName: row.lead_name,
      leadEmail: row.lead_email,
      totalEmailsSent: parseInt(row.total_emails_sent) || 0,
      lastEmailSent: row.last_email_sent || 'Never',
      lastEmailStatus: row.last_email_status || 'none',
      conversionStatus: row.conversion_status
    }));

    res.json({
      success: true,
      data: leadStats
    });

  } catch (error) {
    logger.error('Error fetching lead email stats', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lead email stats',
      error: error.message
    });
  }
});

// Helper function to get encouragement message based on lead data
function getEncouragementMessage(lead) {
  const debtAmount = lead.totalDebt;
  
  if (debtAmount < 10000) {
    return "You're closer to debt freedom than you think! With your current plan, you could be debt-free in just a few years.";
  } else if (debtAmount < 50000) {
    return "Your debt situation is manageable, and with the right strategy, you can eliminate it faster than you imagined.";
  } else {
    return "Even with significant debt, you have a clear path to freedom. Many people have paid off much more and achieved their goals.";
  }
}

module.exports = router;
