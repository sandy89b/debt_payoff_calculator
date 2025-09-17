const { pool } = require('../config/database');

class Debt {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.name = data.name;
    this.balance = parseFloat(data.balance);
    this.interestRate = parseFloat(data.interest_rate);
    this.minimumPayment = parseFloat(data.minimum_payment);
    this.dueDate = data.due_date;
    this.debtType = data.debt_type;
    this.priority = data.priority;
    this.isActive = data.is_active;
    this.paidOffDate = data.paid_off_date;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Create a new debt
  static async create(userId, debtData) {
    try {
      const { name, balance, interestRate, minimumPayment, dueDate, debtType = 'credit_card', priority = 1 } = debtData;
      
      const query = `
        INSERT INTO debts (user_id, name, balance, interest_rate, minimum_payment, due_date, debt_type, priority)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      
      const values = [userId, name, balance, interestRate, minimumPayment, dueDate, debtType, priority];
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Failed to create debt');
      }
      
      return new Debt(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Get all debts for a user
  static async findByUserId(userId, includeInactive = false) {
    try {
      let query = 'SELECT * FROM debts WHERE user_id = $1';
      const values = [userId];
      
      if (!includeInactive) {
        query += ' AND is_active = true';
      }
      
      query += ' ORDER BY priority ASC, balance DESC';
      
      const result = await pool.query(query, values);
      return result.rows.map(row => new Debt(row));
    } catch (error) {
      throw error;
    }
  }

  // Get a specific debt
  static async findById(debtId, userId) {
    try {
      const query = 'SELECT * FROM debts WHERE id = $1 AND user_id = $2';
      const result = await pool.query(query, [debtId, userId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new Debt(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Update a debt
  static async update(debtId, userId, updateData) {
    try {
      const allowedFields = ['name', 'balance', 'interest_rate', 'minimum_payment', 'due_date', 'debt_type', 'priority', 'is_active'];
      const updates = [];
      const values = [];
      let paramCount = 1;

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key)) {
          updates.push(`${key} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      }

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      values.push(debtId, userId);
      const query = `
        UPDATE debts 
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Debt not found or not owned by user');
      }
      
      return new Debt(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Delete a debt (soft delete by setting is_active to false)
  static async delete(debtId, userId) {
    try {
      const query = `
        UPDATE debts 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `;
      
      const result = await pool.query(query, [debtId, userId]);
      
      if (result.rows.length === 0) {
        throw new Error('Debt not found or not owned by user');
      }
      
      return new Debt(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Mark debt as paid off
  static async markAsPaidOff(debtId, userId, paidOffDate = new Date()) {
    try {
      const query = `
        UPDATE debts 
        SET is_active = false, paid_off_date = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND user_id = $3
        RETURNING *
      `;
      
      const result = await pool.query(query, [paidOffDate, debtId, userId]);
      
      if (result.rows.length === 0) {
        throw new Error('Debt not found or not owned by user');
      }
      
      return new Debt(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Get debt statistics for a user
  static async getDebtStats(userId) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_debts,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_debts,
          COUNT(CASE WHEN is_active = false THEN 1 END) as paid_off_debts,
          COALESCE(SUM(CASE WHEN is_active = true THEN balance END), 0) as total_balance,
          COALESCE(SUM(CASE WHEN is_active = true THEN minimum_payment END), 0) as total_minimum_payments,
          COALESCE(AVG(CASE WHEN is_active = true THEN interest_rate END), 0) as average_interest_rate
        FROM debts 
        WHERE user_id = $1
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Calculate debt payoff scenarios
  static async calculatePayoffScenarios(userId, extraPayment = 0) {
    try {
      const debts = await this.findByUserId(userId);
      
      if (debts.length === 0) {
        return { snowball: [], avalanche: [], summary: {} };
      }

      // Sort for snowball method (smallest balance first)
      const snowballDebts = [...debts].sort((a, b) => a.balance - b.balance);
      
      // Sort for avalanche method (highest interest rate first)
      const avalancheDebts = [...debts].sort((a, b) => b.interestRate - a.interestRate);

      const calculatePayoff = (sortedDebts) => {
        const results = [];
        let totalMonths = 0;
        let totalInterest = 0;
        let remainingExtraPayment = extraPayment;

        for (const debt of sortedDebts) {
          const monthlyRate = debt.interestRate / 12;
          let balance = debt.balance;
          let months = 0;
          let interestPaid = 0;
          let payment = debt.minimumPayment;

          while (balance > 0.01 && months < 600) { // Max 50 years
            months++;
            
            // Add extra payment to the first debt in the list
            if (remainingExtraPayment > 0 && debt.id === sortedDebts[0].id) {
              payment = debt.minimumPayment + remainingExtraPayment;
            }

            const interestPayment = balance * monthlyRate;
            const principalPayment = Math.min(payment - interestPayment, balance);
            
            interestPaid += interestPayment;
            balance -= principalPayment;
            
            // If this debt is paid off, add its minimum payment to extra payment for next debt
            if (balance <= 0.01) {
              remainingExtraPayment += debt.minimumPayment;
            }
          }

          results.push({
            debtId: debt.id,
            name: debt.name,
            balance: debt.balance,
            interestRate: debt.interestRate,
            minimumPayment: debt.minimumPayment,
            payoffMonths: months,
            totalInterest: interestPaid,
            payoffDate: new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000)
          });

          totalMonths = Math.max(totalMonths, months);
          totalInterest += interestPaid;
        }

        return { results, totalMonths, totalInterest };
      };

      const snowball = calculatePayoff(snowballDebts);
      const avalanche = calculatePayoff(avalancheDebts);

      return {
        snowball: snowball.results,
        avalanche: avalanche.results,
        summary: {
          snowball: {
            totalMonths: snowball.totalMonths,
            totalInterest: snowball.totalInterest
          },
          avalanche: {
            totalMonths: avalanche.totalMonths,
            totalInterest: avalanche.totalInterest
          }
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      balance: this.balance,
      interestRate: this.interestRate,
      minimumPayment: this.minimumPayment,
      dueDate: this.dueDate,
      debtType: this.debtType,
      priority: this.priority,
      isActive: this.isActive,
      paidOffDate: this.paidOffDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Debt;

