const { pool } = require('../config/database');
const logger = require('../utils/logger');
const debtBalanceMonitor = require('../services/debtBalanceMonitor');

class EnhancedDebt {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.userEmail = data.user_email;
    this.name = data.name;
    this.balance = parseFloat(data.balance || 0);
    // Convert interest rate from decimal back to percentage (e.g., 0.1899 -> 18.99)
    this.interestRate = parseFloat(data.interest_rate || 0) * 100;
    this.minimumPayment = parseFloat(data.minimum_payment || 0);
    this.dueDate = data.due_date;
    this.debtType = data.debt_type || 'other';
    this.description = data.description || '';
    this.originalBalance = parseFloat(data.original_balance || data.balance || 0);
    this.priority = data.priority || 1;
    this.isActive = data.is_active !== false;
    this.isPaidOff = data.paid_off_date !== null;
    this.paidOffDate = data.paid_off_date;
    this.debtStatus = data.debt_status || 'active';
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Create a new debt
  static async create(userId, debtData) {
    try {
      const { 
        name, 
        balance, 
        interestRate, 
        minimumPayment, 
        dueDate, 
        debtType = 'other', 
        description = '',
        priority = 1 
      } = debtData;
      
      // First, get the user's email
      const userQuery = 'SELECT email FROM users WHERE id = $1';
      const userResult = await pool.query(userQuery, [userId]);
      
      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }
      
      const userEmail = userResult.rows[0].email;
      
      const query = `
        INSERT INTO debts (
          user_id, user_email, name, balance, interest_rate, minimum_payment, 
          due_date, debt_type, description, priority, original_balance
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $4)
        RETURNING *
      `;
      
      // Convert interest rate from percentage to decimal (e.g., 18.99 -> 0.1899)
      const interestRateDecimal = parseFloat(interestRate || 0) / 100;
      
      // Debug logging
      logger.info('Creating debt with data:', { 
        name, balance, interestRate, interestRateDecimal, minimumPayment, dueDate, debtType 
      });
      
      const values = [
        userId, userEmail, name, balance, interestRateDecimal, minimumPayment, 
        dueDate, debtType, description, priority
      ];
      
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Failed to create debt');
      }
      
      logger.info('Debt created successfully', { 
        userId, 
        debtId: result.rows[0].id, 
        debtName: name 
      });
      
      return new EnhancedDebt(result.rows[0]);
    } catch (error) {
      logger.error('Error creating debt', error.message);
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
      
      query += ' ORDER BY priority ASC, created_at ASC';
      
      const result = await pool.query(query, values);
      return result.rows.map(row => new EnhancedDebt(row));
    } catch (error) {
      logger.error('Error finding debts by user ID', error.message);
      throw error;
    }
  }

  // Find debt by ID
  static async findById(debtId, userId = null) {
    try {
      let query = 'SELECT * FROM debts WHERE id = $1';
      const values = [debtId];
      
      if (userId) {
        query += ' AND user_id = $2';
        values.push(userId);
      }
      
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new EnhancedDebt(result.rows[0]);
    } catch (error) {
      logger.error('Error finding debt by ID', error.message);
      throw error;
    }
  }

  // Update debt
  static async update(debtId, userId, debtData) {
    try {
      const { 
        name, 
        balance, 
        interestRate, 
        minimumPayment, 
        dueDate, 
        debtType, 
        description,
        priority 
      } = debtData;
      
      // Convert interest rate from percentage to decimal (e.g., 18.99 -> 0.1899)
      const interestRateDecimal = parseFloat(interestRate) / 100;
      
      const query = `
        UPDATE debts 
        SET name = $3, balance = $4, interest_rate = $5, minimum_payment = $6,
            due_date = $7, debt_type = $8, description = $9, priority = $10,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `;
      
      const values = [
        debtId, userId, name, balance, interestRateDecimal, 
        minimumPayment, dueDate, debtType, description, priority
      ];
      
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Debt not found or access denied');
      }
      
      logger.info('Debt updated successfully', { 
        userId, 
        debtId, 
        debtName: name 
      });
      
      return new EnhancedDebt(result.rows[0]);
    } catch (error) {
      logger.error('Error updating debt', error.message);
      throw error;
    }
  }

  // Mark debt as paid off
  static async markAsPaidOff(debtId, userId) {
    try {
      const query = `
        UPDATE debts 
        SET balance = 0, paid_off_date = CURRENT_DATE, is_active = false, debt_status = 'paid_off', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `;
      
      const result = await pool.query(query, [debtId, userId]);
      
      if (result.rows.length === 0) {
        throw new Error('Debt not found or access denied');
      }
      
      logger.info('Debt marked as paid off', { 
        userId, 
        debtId, 
        debtName: result.rows[0].name 
      });
      
      return new EnhancedDebt(result.rows[0]);
    } catch (error) {
      logger.error('Error marking debt as paid off', error.message);
      throw error;
    }
  }

  // Delete debt
  static async delete(debtId, userId) {
    try {
      const query = 'DELETE FROM debts WHERE id = $1 AND user_id = $2 RETURNING *';
      const result = await pool.query(query, [debtId, userId]);
      
      if (result.rows.length === 0) {
        throw new Error('Debt not found or access denied');
      }
      
      logger.info('Debt deleted successfully', { 
        userId, 
        debtId, 
        debtName: result.rows[0].name 
      });
      
      return true;
    } catch (error) {
      logger.error('Error deleting debt', error.message);
      throw error;
    }
  }

  // Get debt statistics for a user
  static async getStatistics(userId) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_debts,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_debts,
          COUNT(CASE WHEN paid_off_date IS NOT NULL THEN 1 END) as paid_off_debts,
          COALESCE(SUM(CASE WHEN is_active = true THEN balance END), 0) as total_balance,
          COALESCE(SUM(CASE WHEN is_active = true THEN minimum_payment END), 0) as total_min_payments,
          COALESCE(SUM(original_balance), 0) as total_original_balance,
          COALESCE(AVG(CASE WHEN is_active = true THEN interest_rate END), 0) as avg_interest_rate
        FROM debts 
        WHERE user_id = $1
      `;
      
      const result = await pool.query(query, [userId]);
      const stats = result.rows[0];
      
      // Calculate progress percentage
      const totalOriginal = parseFloat(stats.total_original_balance);
      const totalRemaining = parseFloat(stats.total_balance);
      const totalPaid = totalOriginal - totalRemaining;
      const progressPercentage = totalOriginal > 0 ? (totalPaid / totalOriginal) * 100 : 0;
      
      return {
        totalDebts: parseInt(stats.total_debts),
        activeDebts: parseInt(stats.active_debts),
        paidOffDebts: parseInt(stats.paid_off_debts),
        totalBalance: parseFloat(stats.total_balance),
        totalMinPayments: parseFloat(stats.total_min_payments),
        totalOriginalBalance: totalOriginal,
        totalPaidOff: totalPaid,
        progressPercentage: Math.round(progressPercentage * 100) / 100,
        avgInterestRate: parseFloat(stats.avg_interest_rate)
      };
    } catch (error) {
      logger.error('Error getting debt statistics', error.message);
      throw error;
    }
  }

  // Calculate payoff scenarios (Snowball vs Avalanche)
  static async calculatePayoffScenarios(userId, extraPayment = 0) {
    try {
      const debts = await this.findByUserId(userId);
      
      if (debts.length === 0) {
        return {
          snowball: { totalMonths: 0, totalInterest: 0, payoffOrder: [] },
          avalanche: { totalMonths: 0, totalInterest: 0, payoffOrder: [] }
        };
      }

      // Snowball method (lowest balance first)
      const snowballDebts = [...debts].sort((a, b) => a.balance - b.balance);
      const snowballResult = this.calculatePayoffStrategy(snowballDebts, extraPayment);

      // Avalanche method (highest interest rate first)
      const avalancheDebts = [...debts].sort((a, b) => b.interestRate - a.interestRate);
      const avalancheResult = this.calculatePayoffStrategy(avalancheDebts, extraPayment);

      return {
        snowball: {
          method: 'snowball',
          totalMonths: snowballResult.totalMonths,
          totalInterest: snowballResult.totalInterest,
          totalPayments: snowballResult.totalPayments,
          payoffOrder: snowballResult.payoffOrder,
          monthlyCashFlow: snowballResult.monthlyCashFlow
        },
        avalanche: {
          method: 'avalanche',
          totalMonths: avalancheResult.totalMonths,
          totalInterest: avalancheResult.totalInterest,
          totalPayments: avalancheResult.totalPayments,
          payoffOrder: avalancheResult.payoffOrder,
          monthlyCashFlow: avalancheResult.monthlyCashFlow
        }
      };
    } catch (error) {
      logger.error('Error calculating payoff scenarios', error.message);
      throw error;
    }
  }

  // Helper method to calculate payoff strategy
  static calculatePayoffStrategy(debts, extraPayment) {
    const debtsCopy = debts.map(debt => ({
      id: debt.id,
      name: debt.name,
      balance: debt.balance,
      interestRate: debt.interestRate / 100, // Convert percentage to decimal
      minimumPayment: debt.minimumPayment,
      monthsToPayoff: 0,
      totalInterest: 0
    }));

    let totalMonths = 0;
    let totalInterest = 0;
    let totalPayments = 0;
    const payoffOrder = [];
    let availableExtra = extraPayment;

    while (debtsCopy.some(debt => debt.balance > 0)) {
      totalMonths++;
      let monthlyExtra = availableExtra;

      // Apply minimum payments and calculate interest
      for (const debt of debtsCopy) {
        if (debt.balance > 0) {
          const monthlyInterest = debt.balance * (debt.interestRate / 12);
          const principalPayment = Math.min(debt.minimumPayment - monthlyInterest, debt.balance);
          
          debt.balance -= principalPayment;
          debt.totalInterest += monthlyInterest;
          totalInterest += monthlyInterest;
          totalPayments += debt.minimumPayment;

          if (debt.balance <= 0) {
            debt.monthsToPayoff = totalMonths;
            payoffOrder.push({
              id: debt.id,
              name: debt.name,
              monthsToPayoff: totalMonths,
              totalInterest: Math.round(debt.totalInterest * 100) / 100
            });
            availableExtra += debt.minimumPayment; // Snowball effect
          }
        }
      }

      // Apply extra payment to first active debt
      const firstActiveDebt = debtsCopy.find(debt => debt.balance > 0);
      if (firstActiveDebt && monthlyExtra > 0) {
        const extraToApply = Math.min(monthlyExtra, firstActiveDebt.balance);
        firstActiveDebt.balance -= extraToApply;
        totalPayments += extraToApply;

        if (firstActiveDebt.balance <= 0) {
          firstActiveDebt.monthsToPayoff = totalMonths;
          if (!payoffOrder.some(p => p.id === firstActiveDebt.id)) {
            payoffOrder.push({
              id: firstActiveDebt.id,
              name: firstActiveDebt.name,
              monthsToPayoff: totalMonths,
              totalInterest: Math.round(firstActiveDebt.totalInterest * 100) / 100
            });
          }
          availableExtra += firstActiveDebt.minimumPayment;
        }
      }

      // Safety check to prevent infinite loops
      if (totalMonths > 600) { // 50 years max
        break;
      }
    }

    return {
      totalMonths,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalPayments: Math.round(totalPayments * 100) / 100,
      payoffOrder,
      monthlyCashFlow: debts.reduce((sum, debt) => sum + debt.minimumPayment, 0) + extraPayment
    };
  }

  // Update debt balance with automatic monitoring
  async updateBalance(newBalance, paymentAmount = 0, changeType = 'payment', notes = '') {
    try {
      const previousBalance = this.balance;
      
      // Record balance change in history
      await debtBalanceMonitor.recordBalanceChange(
        this.id, 
        this.userId, 
        previousBalance, 
        newBalance, 
        paymentAmount, 
        changeType, 
        notes
      );
      
      // Update the debt balance
      const query = `
        UPDATE debts 
        SET balance = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND user_id = $3
        RETURNING *
      `;
      
      const result = await pool.query(query, [newBalance, this.id, this.userId]);
      
      if (result.rows.length > 0) {
        // Update instance properties
        this.balance = newBalance;
        this.updatedAt = result.rows[0].updated_at;
        
        logger.info('Debt balance updated with monitoring', {
          debtId: this.id,
          userId: this.userId,
          previousBalance,
          newBalance,
          paymentAmount
        });
        
        return this;
      }
      
      throw new Error('Failed to update debt balance');
      
    } catch (error) {
      logger.error('Error updating debt balance', error.message);
      throw error;
    }
  }

  // Make a payment towards this debt
  async makePayment(paymentAmount, notes = '') {
    try {
      if (paymentAmount <= 0) {
        throw new Error('Payment amount must be greater than zero');
      }
      
      const newBalance = Math.max(0, this.balance - paymentAmount);
      await this.updateBalance(newBalance, paymentAmount, 'payment', notes);
      
      logger.info('Payment applied to debt', {
        debtId: this.id,
        paymentAmount,
        newBalance
      });
      
      return this;
      
    } catch (error) {
      logger.error('Error making payment', error.message);
      throw error;
    }
  }

  // Convert to JSON for API responses
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      userEmail: this.userEmail,
      name: this.name,
      balance: this.balance,
      interestRate: this.interestRate,
      minimumPayment: this.minimumPayment,
      dueDate: this.dueDate,
      debtType: this.debtType,
      description: this.description,
      originalBalance: this.originalBalance,
      priority: this.priority,
      isActive: this.isActive,
      isPaidOff: this.isPaidOff,
      paidOffDate: this.paidOffDate,
      debtStatus: this.debtStatus,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = EnhancedDebt;
