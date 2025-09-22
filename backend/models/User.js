const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  constructor(data) {
    this.id = data.id;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    this.email = data.email;
    this.passwordHash = data.password_hash;
    this.googleId = data.google_id;
    this.provider = data.provider;
    this.avatarUrl = data.avatar_url;
    this.emailVerified = data.email_verified;
    this.phone = data.phone;
    this.role = data.role;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Create a new user (local registration)
  static async create(userData) {
    const { firstName, lastName, email, phone, password } = userData;
    
    try {
      // Hash the password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      const query = `
        INSERT INTO users (first_name, last_name, email, phone, password_hash, provider)
        VALUES ($1, $2, $3, $4, $5, 'local')
        RETURNING id, first_name, last_name, email, phone, provider, email_verified, role, created_at, updated_at
      `;
      
      const values = [firstName, lastName, email, phone, passwordHash];
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Failed to create user');
      }
      
      const userData = result.rows[0];
      const user = new User(userData);
      
      
      return user;
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  // Create or update OAuth user
  static async createOrUpdateOAuthUser(oauthData) {
    const { googleId, email, firstName, lastName, avatarUrl } = oauthData;
    
    try {
      // First, try to find existing user by Google ID
      let user = await User.findByGoogleId(googleId);
      
      if (user) {
        // Update existing user
        const query = `
          UPDATE users 
          SET first_name = $1, last_name = $2, avatar_url = $3, email_verified = $4, updated_at = CURRENT_TIMESTAMP
          WHERE google_id = $5
          RETURNING id, first_name, last_name, email, google_id, provider, avatar_url, email_verified, role, created_at, updated_at
        `;
        
        const values = [firstName, lastName, avatarUrl, true, googleId];
        const result = await pool.query(query, values);
        
        if (result.rows.length === 0) {
          throw new Error('Failed to update user');
        }
        
        const updatedUser = new User(result.rows[0]);
        updatedUser.isNewUser = false;
        return updatedUser;
      }
      
      // Check if user exists with same email
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        // Update existing user to add Google ID
        const query = `
          UPDATE users 
          SET google_id = $1, provider = 'google', avatar_url = $2, email_verified = $3, updated_at = CURRENT_TIMESTAMP
          WHERE email = $4
          RETURNING id, first_name, last_name, email, google_id, provider, avatar_url, email_verified, role, created_at, updated_at
        `;
        
        const values = [googleId, avatarUrl, true, email];
        const result = await pool.query(query, values);
        
        if (result.rows.length === 0) {
          throw new Error('Failed to update user');
        }
        
        const user = new User(result.rows[0]);
        user.isNewUser = false; // Existing user, just linked to Google
        return user;
      }
      
      // Create new OAuth user
      const query = `
        INSERT INTO users (first_name, last_name, email, google_id, provider, avatar_url, email_verified)
        VALUES ($1, $2, $3, $4, 'google', $5, true)
        RETURNING id, first_name, last_name, email, google_id, provider, avatar_url, email_verified, created_at, updated_at
      `;
      
      const values = [firstName, lastName, email, googleId, avatarUrl];
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Failed to create user');
      }
      
      const newUser = new User(result.rows[0]);
      newUser.isNewUser = true; // Brand new user
      return newUser;
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('User already exists');
      }
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const result = await pool.query(query, [email]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find user by Google ID
  static async findByGoogleId(googleId) {
    try {
      const query = 'SELECT * FROM users WHERE google_id = $1';
      const result = await pool.query(query, [googleId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const query = 'SELECT * FROM users WHERE id = $1';
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Verify password
  async verifyPassword(password) {
    try {
      return await bcrypt.compare(password, this.passwordHash);
    } catch (error) {
      throw error;
    }
  }

  // Get user data without sensitive information
  toJSON() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      name: `${this.firstName} ${this.lastName}`,
      provider: this.provider,
      avatarUrl: this.avatarUrl,
      emailVerified: this.emailVerified,
      phone: this.phone,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Find user by phone number
  static async findByPhone(phone) {
    try {
      const query = 'SELECT * FROM users WHERE phone = $1';
      const result = await pool.query(query, [phone]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find user by email OR phone
  static async findByEmailOrPhone(emailOrPhone) {
    try {
      const query = 'SELECT * FROM users WHERE email = $1 OR phone = $1';
      const result = await pool.query(query, [emailOrPhone]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Check if email exists
  static async emailExists(email) {
    try {
      const query = 'SELECT id FROM users WHERE email = $1';
      const result = await pool.query(query, [email]);
      return result.rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Check if phone exists
  static async phoneExists(phone) {
    try {
      const query = 'SELECT id FROM users WHERE phone = $1';
      const result = await pool.query(query, [phone]);
      return result.rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Update phone verification code
  static async updatePhoneVerificationCode(userId, code) {
    try {
      const query = `
        UPDATE users 
        SET phone_verification_code = $1, phone_verification_expires = NOW() + INTERVAL '15 minutes', updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;
      
      const result = await pool.query(query, [code, userId]);
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating phone verification code:', error);
      throw error;
    }
  }

  // Update phone verification status
  async updatePhoneVerification(verified = true) {
    try {
      const query = `
        UPDATE users 
        SET phone_verified = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;
      
      const result = await pool.query(query, [verified, this.id]);
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      
      // Update instance properties
      const updatedData = result.rows[0];
      Object.assign(this, new User(updatedData));
      
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Generate and store password reset token
  static async generatePasswordResetToken(emailOrPhone) {
    try {
      const user = await User.findByEmailOrPhone(emailOrPhone);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate 6-digit reset code
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      const query = `
        UPDATE users 
        SET password_reset_token = $1, password_reset_expires = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `;

      const result = await pool.query(query, [resetCode, resetExpires, user.id]);
      
      return {
        user: new User(result.rows[0]),
        resetCode,
        resetExpires
      };
    } catch (error) {
      throw error;
    }
  }

  // Verify password reset token
  static async verifyPasswordResetToken(token) {
    try {
      const query = `
        SELECT * FROM users 
        WHERE password_reset_token = $1 
        AND password_reset_expires > NOW()
      `;
      
      const result = await pool.query(query, [token]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Reset password with token
  static async resetPassword(token, newPassword) {
    try {
      const user = await User.verifyPasswordResetToken(token);
      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      // Hash new password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      const query = `
        UPDATE users 
        SET password_hash = $1, 
            password_reset_token = NULL, 
            password_reset_expires = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, first_name, last_name, email, phone
      `;

      const result = await pool.query(query, [passwordHash, user.id]);
      
      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
