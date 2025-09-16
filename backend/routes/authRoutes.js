const express = require('express');
const AuthController = require('../controllers/authController');
const { validateSignup, validateSignin } = require('../validation/userValidation');

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', validateSignup, AuthController.signup);

// @route   POST /api/auth/signin
// @desc    Sign in user
// @access  Public
router.post('/signin', validateSignin, AuthController.signin);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private (TODO: Add JWT middleware)
router.get('/profile', AuthController.getProfile);

module.exports = router;
