const { pool } = require('../config/database');

class Scenario {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.name = data.name;
    this.description = data.description;
    this.scenarioType = data.scenario_type;
    this.parameters = data.parameters;
    this.monthsSaved = data.months_saved;
    this.interestSaved = data.interest_saved;
    this.newPayoffDate = data.new_payoff_date;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Create a new scenario
  static async create(userId, scenarioData) {
    try {
      const { name, description, scenarioType, parameters, monthsSaved, interestSaved, newPayoffDate } = scenarioData;
      
      const query = `
        INSERT INTO scenarios (user_id, name, description, scenario_type, parameters, months_saved, interest_saved, new_payoff_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      
      const values = [userId, name, description, scenarioType, JSON.stringify(parameters), monthsSaved, interestSaved, newPayoffDate];
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Failed to create scenario');
      }
      
      return new Scenario(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Get all scenarios for a user
  static async findByUserId(userId, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT * FROM scenarios 
        WHERE user_id = $1 
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `;
      
      const result = await pool.query(query, [userId, limit, offset]);
      return result.rows.map(row => new Scenario(row));
    } catch (error) {
      throw error;
    }
  }

  // Get scenarios by type
  static async findByType(userId, scenarioType, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT * FROM scenarios 
        WHERE user_id = $1 AND scenario_type = $2
        ORDER BY created_at DESC
        LIMIT $3 OFFSET $4
      `;
      
      const result = await pool.query(query, [userId, scenarioType, limit, offset]);
      return result.rows.map(row => new Scenario(row));
    } catch (error) {
      throw error;
    }
  }

  // Get a specific scenario
  static async findById(scenarioId, userId) {
    try {
      const query = 'SELECT * FROM scenarios WHERE id = $1 AND user_id = $2';
      const result = await pool.query(query, [scenarioId, userId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new Scenario(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Update a scenario
  static async update(scenarioId, userId, updateData) {
    try {
      const allowedFields = ['name', 'description', 'parameters', 'months_saved', 'interest_saved', 'new_payoff_date'];
      const updates = [];
      const values = [];
      let paramCount = 1;

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key)) {
          if (key === 'parameters') {
            updates.push(`${key} = $${paramCount}`);
            values.push(JSON.stringify(value));
          } else {
            updates.push(`${key} = $${paramCount}`);
            values.push(value);
          }
          paramCount++;
        }
      }

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      values.push(scenarioId, userId);
      const query = `
        UPDATE scenarios 
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Scenario not found or not owned by user');
      }
      
      return new Scenario(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Delete a scenario
  static async delete(scenarioId, userId) {
    try {
      const query = 'DELETE FROM scenarios WHERE id = $1 AND user_id = $2 RETURNING *';
      const result = await pool.query(query, [scenarioId, userId]);
      
      if (result.rows.length === 0) {
        throw new Error('Scenario not found or not owned by user');
      }
      
      return new Scenario(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Get scenario statistics
  static async getScenarioStats(userId) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_scenarios,
          COUNT(CASE WHEN scenario_type = 'bonus' THEN 1 END) as bonus_scenarios,
          COUNT(CASE WHEN scenario_type = 'income_change' THEN 1 END) as income_scenarios,
          COUNT(CASE WHEN scenario_type = 'rate_change' THEN 1 END) as rate_scenarios,
          COUNT(CASE WHEN scenario_type = 'custom' THEN 1 END) as custom_scenarios,
          COALESCE(SUM(months_saved), 0) as total_months_saved,
          COALESCE(SUM(interest_saved), 0) as total_interest_saved
        FROM scenarios 
        WHERE user_id = $1
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows[0];
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
      description: this.description,
      scenarioType: this.scenarioType,
      parameters: this.parameters,
      monthsSaved: this.monthsSaved,
      interestSaved: this.interestSaved,
      newPayoffDate: this.newPayoffDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Scenario;

