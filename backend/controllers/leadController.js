const { pool } = require('../config/database');
const logger = require('../utils/logger');
const AuthController = require('./authController');

// Admin creates a lead and optionally initial debt figures.
// Sends password-setup email to the lead to become a user.
exports.adminCreateLead = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      totalDebt = 0,
      totalMinPayments = 0,
      extraPayment = 0,
      debtCount = 0
    } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // 1) Create or find user shell (without password) using model helper
    const User = require('../models/User');
    const user = await User.upsertShell({ firstName, lastName, email, phone });

    console.log('User created:', user);
    // 2) Ensure a lead exists and link to user (manual upsert by email)
    const existingLeadRes = await pool.query('SELECT id FROM leads WHERE email = $1', [email]);
    let lead;
    if (existingLeadRes.rows.length > 0) {
      const updateRes = await pool.query(
        `UPDATE leads SET 
           first_name = $1,
           last_name = $2,
           phone = $3,
           total_debt = $4,
           total_min_payments = $5,
           extra_payment = $6,
           debt_count = $7,
           status = $8,
           user_id = COALESCE(user_id, $9),
           updated_at = NOW()
         WHERE email = $10
         RETURNING *`,
        [firstName || null, lastName || null, phone || null, totalDebt, totalMinPayments, extraPayment, debtCount, 'nurturing', user.id, email]
      );
      lead = updateRes.rows[0];
    } else {
      const insertRes = await pool.query(
        `INSERT INTO leads (first_name, last_name, email, phone, total_debt, total_min_payments, extra_payment, debt_count, status, user_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         RETURNING *`,
        [firstName || null, lastName || null, email, phone || null, totalDebt, totalMinPayments, extraPayment, debtCount, 'nurturing', user.id]
      );
      lead = insertRes.rows[0];
    }

    // 3) Create password setup token and email
    const token = AuthController.__private_generatePasswordSetupToken
      ? AuthController.__private_generatePasswordSetupToken(user.id)
      : require('jsonwebtoken').sign({ sub: user.id, purpose: 'password_setup' }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '5m' });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    const setupUrl = `${frontendUrl}/set-password?token=${encodeURIComponent(token)}`;
    await (AuthController.__private_sendPasswordSetupEmail
      ? AuthController.__private_sendPasswordSetupEmail(email, setupUrl)
      : require('../controllers/authController').sendPasswordSetupEmail(email, setupUrl));

    // Log this transactional email so it appears in analytics
    try {
      const emailAutomationService = require('../services/emailAutomationService');
      await emailAutomationService.logLeadEmail(
        lead.id,
        'password_setup',
        null,
        email,
        'sent',
        null
      );
    } catch (logErr) {
      logger.warn('Failed to log password setup email to lead analytics', logErr.message);
    }

    logger.info('Admin created lead and sent password setup email', { leadId: lead.id, userId: user.id });
    return res.status(201).json({ success: true, data: { lead, userId: user.id } });
  } catch (error) {
    logger.error('Error creating lead from admin', error.message);
    return res.status(500).json({ success: false, message: 'Failed to create lead' });
  }
};


