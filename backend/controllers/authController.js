const User = require('../models/User');

class AuthController {
  // User signup
  static async signup(req, res) {
    try {
      console.log('Signup request received:', { 
        body: req.body, 
        validatedData: req.validatedData 
      });
      
      const { firstName, lastName, email, password } = req.validatedData;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Create new user
      const user = await User.create({
        firstName,
        lastName,
        email,
        password
      });

      // Return user data (without password)
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          user: user.toJSON()
        }
      });

    } catch (error) {
      console.error('Signup error:', error);
      
      if (error.message === 'Email already exists') {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }

  // User signin
  static async signin(req, res) {
    try {
      const { email, password } = req.validatedData;

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Verify password
      const isPasswordValid = await user.verifyPassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // TODO: Generate JWT token here
      // For now, just return user data
      res.status(200).json({
        success: true,
        message: 'Sign in successful',
        data: {
          user: user.toJSON()
        }
      });

    } catch (error) {
      console.error('Signin error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      // TODO: Get user ID from JWT token
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          user: user.toJSON()
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }
}

module.exports = AuthController;
