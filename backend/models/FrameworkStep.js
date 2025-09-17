const { pool } = require('../config/database');

class FrameworkStep {
  constructor(data) {
    this.id = data.id;
    this.stepNumber = data.step_number;
    this.title = data.title;
    this.subtitle = data.subtitle;
    this.description = data.description;
    this.biblicalReference = data.biblical_reference;
    this.iconName = data.icon_name;
    this.instructions = data.instructions;
    this.worksheetQuestions = data.worksheet_questions;
    this.successCriteria = data.success_criteria;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Get all framework steps
  static async findAll() {
    try {
      const query = 'SELECT * FROM framework_steps ORDER BY step_number ASC';
      const result = await pool.query(query);
      return result.rows.map(row => new FrameworkStep(row));
    } catch (error) {
      throw error;
    }
  }

  // Get a specific framework step
  static async findByStepNumber(stepNumber) {
    try {
      const query = 'SELECT * FROM framework_steps WHERE step_number = $1';
      const result = await pool.query(query, [stepNumber]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new FrameworkStep(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Get user's progress for all framework steps
  static async getUserProgress(userId) {
    try {
      const query = `
        SELECT 
          fs.*,
          ufp.is_completed,
          ufp.completion_date,
          ufp.progress_percentage,
          ufp.worksheet_responses,
          ufp.notes
        FROM framework_steps fs
        LEFT JOIN user_framework_progress ufp ON fs.id = ufp.step_id AND ufp.user_id = $1
        ORDER BY fs.step_number ASC
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows.map(row => ({
        step: new FrameworkStep(row),
        progress: {
          isCompleted: row.is_completed || false,
          completionDate: row.completion_date,
          progressPercentage: row.progress_percentage || 0,
          worksheetResponses: row.worksheet_responses || {},
          notes: row.notes
        }
      }));
    } catch (error) {
      throw error;
    }
  }

  // Update user progress for a framework step
  static async updateUserProgress(userId, stepId, progressData) {
    try {
      const { isCompleted, progressPercentage, worksheetResponses, notes } = progressData;
      
      const query = `
        INSERT INTO user_framework_progress (user_id, step_id, is_completed, progress_percentage, worksheet_responses, notes, completion_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (user_id, step_id)
        DO UPDATE SET
          is_completed = EXCLUDED.is_completed,
          progress_percentage = EXCLUDED.progress_percentage,
          worksheet_responses = EXCLUDED.worksheet_responses,
          notes = EXCLUDED.notes,
          completion_date = CASE WHEN EXCLUDED.is_completed = true AND user_framework_progress.is_completed = false 
                                 THEN EXCLUDED.completion_date 
                                 ELSE user_framework_progress.completion_date END,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;
      
      const completionDate = isCompleted ? new Date() : null;
      const values = [userId, stepId, isCompleted, progressPercentage, JSON.stringify(worksheetResponses), notes, completionDate];
      
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Failed to update framework progress');
      }
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get user's current framework step
  static async getCurrentStep(userId) {
    try {
      const query = `
        SELECT fs.*
        FROM framework_steps fs
        LEFT JOIN user_framework_progress ufp ON fs.id = ufp.step_id AND ufp.user_id = $1
        WHERE ufp.is_completed = false OR ufp.is_completed IS NULL
        ORDER BY fs.step_number ASC
        LIMIT 1
      `;
      
      const result = await pool.query(query, [userId]);
      
      if (result.rows.length === 0) {
        // User has completed all steps, return the last step
        const lastStepQuery = 'SELECT * FROM framework_steps ORDER BY step_number DESC LIMIT 1';
        const lastStepResult = await pool.query(lastStepQuery);
        return lastStepResult.rows.length > 0 ? new FrameworkStep(lastStepResult.rows[0]) : null;
      }
      
      return new FrameworkStep(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Get framework completion statistics
  static async getCompletionStats(userId) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_steps,
          COUNT(CASE WHEN ufp.is_completed = true THEN 1 END) as completed_steps,
          COUNT(CASE WHEN ufp.is_completed = false OR ufp.is_completed IS NULL THEN 1 END) as remaining_steps,
          ROUND(
            (COUNT(CASE WHEN ufp.is_completed = true THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
          ) as completion_percentage
        FROM framework_steps fs
        LEFT JOIN user_framework_progress ufp ON fs.id = ufp.step_id AND ufp.user_id = $1
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Check if user has completed all framework steps
  static async isFrameworkComplete(userId) {
    try {
      const stats = await this.getCompletionStats(userId);
      return stats.completed_steps === stats.total_steps;
    } catch (error) {
      throw error;
    }
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      stepNumber: this.stepNumber,
      title: this.title,
      subtitle: this.subtitle,
      description: this.description,
      biblicalReference: this.biblicalReference,
      iconName: this.iconName,
      instructions: this.instructions,
      worksheetQuestions: this.worksheetQuestions,
      successCriteria: this.successCriteria,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = FrameworkStep;

