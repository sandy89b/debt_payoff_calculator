const { google } = require('googleapis');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const Lead = require('../models/Lead');
const emailAutomationService = require('../services/emailAutomationService');

class GoogleAuthController {
  // Generate Google OAuth URL
  static async getAuthUrl(req, res) {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      const scopes = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ];

      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'select_account'
      });

      res.json({
        success: true,
        authUrl: authUrl
      });

    } catch (error) {
      console.error('Error generating auth URL:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate authentication URL'
      });
    }
  }

  // Handle Google OAuth callback
  static async handleCallback(req, res) {
    try {
      const { code } = req.query;

      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'Authorization code not provided'
        });
      }

      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      // Exchange code for tokens
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // Get user info from Google
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const { data } = await oauth2.userinfo.get();

      const { id: googleId, email, given_name: firstName, family_name: lastName, picture: avatarUrl } = data;

      console.log('Google OAuth user data:', { googleId, email, firstName, lastName, avatarUrl });

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email not provided by Google'
        });
      }

      // Create or update user in database
      console.log('Creating/updating OAuth user...');
      const user = await User.createOrUpdateOAuthUser({
        googleId,
        email,
        firstName: firstName || 'User',
        lastName: lastName || '',
        avatarUrl
      });
      
      console.log('OAuth user processed successfully:', { id: user.id, email: user.email, provider: user.provider, isNewUser: user.isNewUser });

      // Ensure a lead exists and is linked/converted for this OAuth signup
      try {
        let existingLead = await Lead.findByEmail(email);
        if (!existingLead) {
          existingLead = await Lead.create({
            firstName: user.firstName || firstName || 'User',
            lastName: user.lastName || lastName || '',
            email,
            phone: null,
            totalDebt: 0,
            totalMinPayments: 0,
            extraPayment: 0,
            debtCount: 0,
            calculationResults: null,
            source: 'google_oauth'
          });
          logger.info('Lead auto-created during Google OAuth signup', { leadId: existingLead.id, email });
        }

        await Lead.convertToUser(existingLead.id, user.id);
        logger.info('Lead converted to user during Google OAuth signup', { leadId: existingLead.id, userId: user.id, email });
      } catch (leadError) {
        logger.error('Failed to ensure lead on Google OAuth signup', { email, userId: user.id, error: leadError.message });
      }

      // Trigger welcome email automation for new users
      // Note: OAuth users have verified emails by default, so welcome email is sent immediately
      if (user.isNewUser) {
        try {
          await emailAutomationService.triggerCampaignByEvent('user_signup', user.id, {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          });
          logger.info('Welcome email automation triggered for OAuth user', { userId: user.id, email: user.email });
        } catch (emailError) {
          // Don't fail OAuth if email automation fails
          logger.error('Failed to trigger welcome email automation for OAuth user', emailError.message);
        }
      }

      // If 2FA enabled, redirect with a 2FA challenge token
      const { rows } = await require('../config/database').pool.query('SELECT two_factor_enabled FROM users WHERE id=$1', [user.id]);
      if (rows[0]?.two_factor_enabled) {
        const tempToken = jwt.sign({ userId: user.id, type: '2fa' }, process.env.JWT_SECRET, { expiresIn: '5m' });
        const challengeUrl = `${process.env.FRONTEND_URL}/auth/success?twofa=1&temp=${tempToken}`;
        return res.redirect(challengeUrl);
      }

      // Otherwise, generate normal JWT and complete login
      const token = jwt.sign({ userId: user.id, email: user.email, provider: user.provider }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
      res.cookie('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
      const frontendUrl = `${process.env.FRONTEND_URL}/auth/success?token=${token}`;
      res.redirect(frontendUrl);

    } catch (error) {
      console.error('Google OAuth callback error:', error);
      
      let errorMessage = 'Authentication failed';
      
      // Provide more specific error messages
      if (error.message.includes('relation "users" does not exist')) {
        errorMessage = 'Database not initialized. Please contact support.';
      } else if (error.message.includes('User already exists')) {
        errorMessage = 'Account already exists. Please try signing in.';
      } else if (error.message.includes('Email already exists')) {
        errorMessage = 'Email already registered. Please try signing in.';
      } else if (error.message.includes('Failed to create user')) {
        errorMessage = 'Failed to create account. Please try again.';
      } else if (error.message.includes('Failed to update user')) {
        errorMessage = 'Failed to update account. Please try again.';
      }
      
      // Redirect to frontend with specific error
      const frontendUrl = `${process.env.FRONTEND_URL}/auth/error?message=${encodeURIComponent(errorMessage)}`;
      res.redirect(frontendUrl);
    }
  }

  // Verify JWT token
  static async verifyToken(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token not provided'
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          user: user.toJSON(),
          token: token
        }
      });

    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  }
}

module.exports = GoogleAuthController;
