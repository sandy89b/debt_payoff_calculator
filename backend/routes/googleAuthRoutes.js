const express = require('express');
const GoogleAuthController = require('../controllers/googleAuthController');

const router = express.Router();

// @route   GET /api/auth/google/url
// @desc    Get Google OAuth URL
// @access  Public
router.get('/url', GoogleAuthController.getAuthUrl);

// @route   GET /api/auth/google/callback
// @desc    Handle Google OAuth callback
// @access  Public
router.get('/callback', GoogleAuthController.handleCallback);

// @route   POST /api/auth/google/verify
// @desc    Verify JWT token
// @access  Public
router.post('/verify', GoogleAuthController.verifyToken);

module.exports = router;
