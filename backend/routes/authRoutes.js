const express = require('express');
const AuthController = require('../controllers/authController');
const { 
  validateSignup, 
  validateSignin, 
  validateVerifyPhone 
} = require('../validation/userValidation');

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', validateSignup, AuthController.signup);

// @route   POST /api/auth/signin
// @desc    Sign in user
// @access  Public
router.post('/signin', validateSignin, AuthController.signin);
router.post('/verify-2fa', AuthController.verifyTwoFactor);
// Short-lived password setup link
router.post('/set-password', AuthController.setPassword);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private (TODO: Add JWT middleware)
router.get('/profile', AuthController.getProfile);

// Email verification endpoints
router.post('/verify-code', AuthController.verifyCode);
router.post('/resend-code', AuthController.resendCode);

// Phone verification endpoints
router.post('/send-phone-code', AuthController.sendPhoneCode);
router.post('/verify-phone-code', validateVerifyPhone, AuthController.verifyPhoneCode);

// Password reset endpoints (email-based)
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Password reset endpoints (phone-based)
router.post('/forgot-password-phone', AuthController.forgotPasswordPhone);
router.post('/reset-password-phone', AuthController.resetPasswordPhone);

module.exports = router;