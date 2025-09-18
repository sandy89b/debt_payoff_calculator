const User = require('../models/User');
const { pool } = require('../config/database');
const sgMail = require('@sendgrid/mail');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const emailAutomationService = require('../services/emailAutomationService');

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generatePasswordResetToken(userId) {
  return jwt.sign({ userId, type: 'password_reset' }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

async function sendVerificationEmail(to, code) {
  if (!process.env.SENDGRID_API_KEY) {
    logger.devInfo(`Verification code for ${to}: ${code}`);
    return true;
  }
  
  try {
    const from = process.env.EMAIL_FROM || '23blastfan@gmail.com';
    const msg = {
      to,
      from,
      subject: 'Your Legacy Mindset Solutions verification code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2d5a27;">Legacy Mindset Solutions</h2>
          <p>Your verification code is:</p>
          <div style="background-color: #f0f8f0; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #2d5a27; font-size: 32px; margin: 0; letter-spacing: 4px;">${code}</h1>
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">Legacy Mindset Solutions - Harmony in Finance, Harmony in Life</p>
        </div>
      `,
      text: `Your Legacy Mindset Solutions verification code is: ${code}. This code will expire in 15 minutes.`
    };
    
    await sgMail.send(msg);
    logger.emailSent('verification', to);
    return true;
  } catch (error) {
    logger.emailError('verification', to, error);
    
    if (process.env.NODE_ENV === 'development') {
      logger.devInfo(`Verification code for ${to}: ${code}`);
      return true;
    }
    throw error;
  }
}

async function sendPasswordResetEmail(to, resetUrl) {
  if (!process.env.SENDGRID_API_KEY) {
    logger.devInfo(`Password reset link for ${to}: ${resetUrl}`);
    return true;
  }
  
  try {
    const from = process.env.EMAIL_FROM || '23blastfan@gmail.com';
    const msg = {
      to,
      from,
      subject: 'Reset Your Legacy Mindset Solutions Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2d5a27;">Legacy Mindset Solutions</h2>
          <p>We received a request to reset your password. Click the button below to reset it:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #2d5a27; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
          </div>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">Legacy Mindset Solutions - Harmony in Finance, Harmony in Life</p>
        </div>
      `,
      text: `Reset your Legacy Mindset Solutions password by clicking this link: ${resetUrl}. This link will expire in 1 hour.`
    };
    
    await sgMail.send(msg);
    logger.emailSent('password reset', to);
    return true;
  } catch (error) {
    logger.emailError('password reset', to, error);
    
    if (process.env.NODE_ENV === 'development') {
      logger.devInfo(`Password reset link for ${to}: ${resetUrl}`);
      return true;
    }
    throw error;
  }
}

class AuthController {
  static async signup(req, res) {
    try {
      const { firstName, lastName, email, password } = req.validatedData;

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      const user = await User.create({
        firstName,
        lastName,
        email,
        password
      });

      const code = generateVerificationCode();
      const updateQuery = `
        UPDATE users SET verification_code = $1, verification_expires_at = NOW() + INTERVAL '15 minutes'
        WHERE id = $2
      `;
      await pool.query(updateQuery, [code, user.id]);

      await sendVerificationEmail(email, code);

      logger.authSuccess('signup', email);
      res.status(201).json({
        success: true,
        message: 'User created successfully. Verification code sent to email.',
        data: { user: user.toJSON(), requiresVerification: true }
      });

    } catch (error) {
      logger.authError('signup', req.validatedData?.email, error);
      
      if (error.message === 'Email already exists') {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async signin(req, res) {
    try {
      const { email, password } = req.validatedData;

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const isValidPassword = await user.verifyPassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      logger.authSuccess('signin', email);
      res.json({
        success: true,
        message: 'Sign in successful',
        data: { user: user.toJSON() }
      });

    } catch (error) {
      logger.authError('signin', req.validatedData?.email, error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getProfile(req, res) {
    try {
      res.json({
        success: true,
        message: 'Profile endpoint - TODO: implement JWT middleware',
        data: { user: null }
      });
    } catch (error) {
      logger.error('Get profile error', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async verifyCode(req, res) {
    try {
      const { email, code } = req.body;
      
      if (!email || !code) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email and code are required' 
        });
      }

      const query = `SELECT id, verification_code, verification_expires_at FROM users WHERE email = $1`;
      const result = await pool.query(query, [email]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      const row = result.rows[0];
      
      if (!row.verification_code || !row.verification_expires_at) {
        return res.status(400).json({ 
          success: false, 
          message: 'No active verification code' 
        });
      }

      if (new Date(row.verification_expires_at) < new Date()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Verification code expired' 
        });
      }

      if (row.verification_code !== code) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid verification code' 
        });
      }

      await pool.query(
        `UPDATE users SET email_verified = true, verification_code = NULL, verification_expires_at = NULL WHERE id = $1`,
        [row.id]
      );

      const user = await User.findById(row.id);
      
      // Trigger welcome email automation after email verification
      try {
        await emailAutomationService.triggerCampaignByEvent('user_signup', user.id, {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        });
        logger.info('Welcome email automation triggered after verification', { userId: user.id, email: user.email });
      } catch (emailError) {
        // Don't fail verification if email automation fails
        logger.error('Failed to trigger welcome email automation after verification', emailError.message);
      }
      
      logger.authSuccess('email verification', email);
      
      return res.json({ 
        success: true, 
        message: 'Email verified', 
        data: { user: user.toJSON() } 
      });
    } catch (error) {
      logger.authError('email verification', req.body?.email, error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }

  static async resendCode(req, res) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email is required' 
        });
      }

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      const code = generateVerificationCode();
      await pool.query(
        `UPDATE users SET verification_code = $1, verification_expires_at = NOW() + INTERVAL '15 minutes' WHERE id = $2`,
        [code, user.id]
      );

      await sendVerificationEmail(email, code);
      
      logger.info('Verification code resent', { email });
      return res.json({ 
        success: true, 
        message: 'Verification code resent' 
      });
    } catch (error) {
      logger.authError('resend code', req.body?.email, error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }

  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email is required' 
        });
      }

      const user = await User.findByEmail(email);
      if (!user) {
        return res.json({ 
          success: true, 
          message: 'If an account with that email exists, we sent a password reset link.' 
        });
      }

      const resetToken = generatePasswordResetToken(user.id);
      const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

      await pool.query(
        `UPDATE users SET password_reset_token = $1, password_reset_expires_at = NOW() + INTERVAL '1 hour' WHERE id = $2`,
        [resetToken, user.id]
      );

      await sendPasswordResetEmail(email, resetUrl);

      logger.info('Password reset requested', { email });
      res.json({
        success: true,
        message: 'Password reset link sent to your email.'
      });

    } catch (error) {
      logger.authError('forgot password', req.body?.email, error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ 
          success: false, 
          message: 'Token and new password are required' 
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ 
          success: false, 
          message: 'Password must be at least 6 characters long' 
        });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.type !== 'password_reset') {
          throw new Error('Invalid token type');
        }
      } catch (error) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid or expired reset token' 
        });
      }

      const query = `SELECT id, password_reset_expires_at FROM users WHERE password_reset_token = $1`;
      const result = await pool.query(query, [token]);
      
      if (result.rows.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid or expired reset token' 
        });
      }

      const row = result.rows[0];
      if (!row.password_reset_expires_at || new Date(row.password_reset_expires_at) < new Date()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Reset token has expired' 
        });
      }

      const bcrypt = require('bcryptjs');
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      await pool.query(
        `UPDATE users SET password_hash = $1, password_reset_token = NULL, password_reset_expires_at = NULL WHERE id = $2`,
        [passwordHash, row.id]
      );

      logger.authSuccess('password reset', `user_id: ${row.id}`);
      res.json({
        success: true,
        message: 'Password reset successfully. You can now sign in with your new password.'
      });

    } catch (error) {
      logger.authError('password reset', 'token-based', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = AuthController;