const { pool } = require('../config/database');
const logger = require('../utils/logger');

class Lead {
  constructor(data) {
    this.id = data.id;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    this.email = data.email;
    this.phone = data.phone;
    this.totalDebt = parseFloat(data.total_debt || 0);
    this.totalMinPayments = parseFloat(data.total_min_payments || 0);
    this.extraPayment = parseFloat(data.extra_payment || 0);
    this.debtCount = data.debt_count || 0;
    // Safely parse calculation results
    try {
      this.calculationResults = data.calculation_results ? JSON.parse(data.calculation_results) : null;
    } catch (error) {
      logger.warn('Error parsing calculation results:', error.message);
      this.calculationResults = null;
    }
    this.status = data.status || 'new';
    this.source = data.source || 'debt_calculator';
    this.userId = data.user_id;
    this.convertedAt = data.converted_at;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Create a new lead
  static async create(leadData) {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        totalDebt,
        totalMinPayments,
        extraPayment,
        debtCount,
        calculationResults,
        source = 'debt_calculator'
      } = leadData;

      const query = `
        INSERT INTO leads (
          first_name, last_name, email, phone, total_debt, total_min_payments,
          extra_payment, debt_count, calculation_results, status, source
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;

      // Safely serialize calculation results
      let serializedResults = null;
      if (calculationResults) {
        try {
          serializedResults = JSON.stringify(calculationResults);
        } catch (error) {
          logger.warn('Error serializing calculation results:', error.message);
          serializedResults = null;
        }
      }

      const values = [
        firstName,
        lastName,
        email,
        phone || null,
        totalDebt,
        totalMinPayments,
        extraPayment,
        debtCount,
        serializedResults,
        'new',
        source
      ];

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('Failed to create lead');
      }

      logger.info('Lead created successfully', {
        leadId: result.rows[0].id,
        email,
        source
      });

      return new Lead(result.rows[0]);
    } catch (error) {
      logger.error('Error creating lead', error.message);
      throw error;
    }
  }

  // Find lead by email
  static async findByEmail(email) {
    try {
      const query = 'SELECT * FROM leads WHERE email = $1 ORDER BY created_at DESC';
      const result = await pool.query(query, [email]);

      if (result.rows.length === 0) {
        return null;
      }

      return new Lead(result.rows[0]);
    } catch (error) {
      logger.error('Error finding lead by email', error.message);
      throw error;
    }
  }

  // Get all leads with pagination
  static async findAll(limit = 50, offset = 0, status = null) {
    try {
      let query = 'SELECT * FROM leads';
      const values = [];
      let paramCount = 0;

      if (status) {
        query += ' WHERE status = $1';
        values.push(status);
        paramCount = 1;
      }

      query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      values.push(limit, offset);

      const result = await pool.query(query, values);
      return result.rows.map(row => new Lead(row));
    } catch (error) {
      logger.error('Error finding leads', error.message);
      throw error;
    }
  }

  // Convert lead to user
  static async convertToUser(leadId, userId) {
    try {
      const query = `
        UPDATE leads 
        SET status = 'converted', user_id = $1, converted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;

      const result = await pool.query(query, [userId, leadId]);

      if (result.rows.length === 0) {
        throw new Error('Lead not found');
      }

      logger.info('Lead converted to user', {
        leadId,
        userId,
        email: result.rows[0].email
      });

      return new Lead(result.rows[0]);
    } catch (error) {
      logger.error('Error converting lead to user', error.message);
      throw error;
    }
  }

  // Update lead status
  static async updateStatus(leadId, status) {
    try {
      const query = `
        UPDATE leads 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;

      const result = await pool.query(query, [status, leadId]);

      if (result.rows.length === 0) {
        throw new Error('Lead not found');
      }

      return new Lead(result.rows[0]);
    } catch (error) {
      logger.error('Error updating lead status', error.message);
      throw error;
    }
  }

  // Get lead statistics
  static async getStatistics() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_leads,
          COUNT(CASE WHEN status = 'new' THEN 1 END) as new_leads,
          COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted_leads,
          COUNT(CASE WHEN status = 'nurturing' THEN 1 END) as nurturing_leads,
          COUNT(CASE WHEN status = 'lost' THEN 1 END) as lost_leads,
          COALESCE(AVG(total_debt), 0) as avg_debt_amount,
          COALESCE(SUM(total_debt), 0) as total_debt_value
        FROM leads
      `;

      const result = await pool.query(query);
      const stats = result.rows[0];

      return {
        totalLeads: parseInt(stats.total_leads),
        newLeads: parseInt(stats.new_leads),
        convertedLeads: parseInt(stats.converted_leads),
        nurturingLeads: parseInt(stats.nurturing_leads),
        lostLeads: parseInt(stats.lost_leads),
        avgDebtAmount: parseFloat(stats.avg_debt_amount),
        totalDebtValue: parseFloat(stats.total_debt_value),
        conversionRate: stats.total_leads > 0 ? (stats.converted_leads / stats.total_leads) * 100 : 0
      };
    } catch (error) {
      logger.error('Error getting lead statistics', error.message);
      throw error;
    }
  }

  // Convert to JSON for API responses
  toJSON() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      totalDebt: this.totalDebt,
      totalMinPayments: this.totalMinPayments,
      extraPayment: this.extraPayment,
      debtCount: this.debtCount,
      calculationResults: this.calculationResults,
      status: this.status,
      source: this.source,
      userId: this.userId,
      convertedAt: this.convertedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Lead;
