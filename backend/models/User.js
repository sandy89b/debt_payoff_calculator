const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  constructor(data) {
    this.id = data.id;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    this.email = data.email;
    this.passwordHash = data.password_hash;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Create a new user
  static async create(userData) {
    const { firstName, lastName, email, password } = userData;
    
    try {
      // Hash the password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      const query = `
        INSERT INTO users (first_name, last_name, email, password_hash)
        VALUES ($1, $2, $3, $4)
        RETURNING id, first_name, last_name, email, created_at, updated_at
      `;
      
      const values = [firstName, lastName, email, passwordHash];
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Failed to create user');
      }
      
      const userData = result.rows[0];
      return new User(userData);
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('Email already exists');
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
