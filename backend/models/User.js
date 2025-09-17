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
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Create a new user (local registration)
  static async create(userData) {
    const { firstName, lastName, email, password } = userData;
    
    try {
      // Hash the password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      const query = `
        INSERT INTO users (first_name, last_name, email, password_hash, provider)
        VALUES ($1, $2, $3, $4, 'local')
        RETURNING id, first_name, last_name, email, provider, email_verified, created_at, updated_at
      `;
      
      const values = [firstName, lastName, email, passwordHash];
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
          RETURNING id, first_name, last_name, email, google_id, provider, avatar_url, email_verified, created_at, updated_at
        `;
        
        const values = [firstName, lastName, avatarUrl, true, googleId];
        const result = await pool.query(query, values);
        
        if (result.rows.length === 0) {
          throw new Error('Failed to update user');
        }
        
        return new User(result.rows[0]);
      }
      
      // Check if user exists with same email
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        // Update existing user to add Google ID
        const query = `
          UPDATE users 
          SET google_id = $1, provider = 'google', avatar_url = $2, email_verified = $3, updated_at = CURRENT_TIMESTAMP
          WHERE email = $4
          RETURNING id, first_name, last_name, email, google_id, provider, avatar_url, email_verified, created_at, updated_at
        `;
        
        const values = [googleId, avatarUrl, true, email];
        const result = await pool.query(query, values);
        
        if (result.rows.length === 0) {
          throw new Error('Failed to update user');
        }
        
        const user = new User(result.rows[0]);
        
        
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
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
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
}

module.exports = User;
