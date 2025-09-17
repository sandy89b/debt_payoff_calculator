const { pool } = require('../config/database');

class Achievement {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.iconName = data.icon_name;
    this.criteriaType = data.criteria_type;
    this.criteriaValue = data.criteria_value;
    this.points = data.points;
    this.badgeColor = data.badge_color;
    this.createdAt = data.created_at;
  }

  // Get all achievements
  static async findAll() {
    try {
      const query = 'SELECT * FROM achievements ORDER BY points ASC';
      const result = await pool.query(query);
      return result.rows.map(row => new Achievement(row));
    } catch (error) {
      throw error;
    }
  }

  // Get a specific achievement
  static async findById(achievementId) {
    try {
      const query = 'SELECT * FROM achievements WHERE id = $1';
      const result = await pool.query(query, [achievementId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new Achievement(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Get user's achievements
  static async getUserAchievements(userId) {
    try {
      const query = `
        SELECT 
          a.*,
          ua.earned_date,
          ua.progress_value
        FROM achievements a
        LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = $1
        ORDER BY a.points ASC
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows.map(row => ({
        achievement: new Achievement(row),
        userProgress: {
          earnedDate: row.earned_date,
          progressValue: row.progress_value
        }
      }));
    } catch (error) {
      throw error;
    }
  }

  // Get user's earned achievements
  static async getEarnedAchievements(userId) {
    try {
      const query = `
        SELECT a.*, ua.earned_date
        FROM achievements a
        INNER JOIN user_achievements ua ON a.id = ua.achievement_id
        WHERE ua.user_id = $1
        ORDER BY ua.earned_date DESC
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows.map(row => ({
        achievement: new Achievement(row),
        earnedDate: row.earned_date
      }));
    } catch (error) {
      throw error;
    }
  }

  // Award an achievement to a user
  static async awardAchievement(userId, achievementId, progressValue = null) {
    try {
      const query = `
        INSERT INTO user_achievements (user_id, achievement_id, progress_value)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, achievement_id)
        DO UPDATE SET
          progress_value = COALESCE(EXCLUDED.progress_value, user_achievements.progress_value)
        RETURNING *
      `;
      
      const result = await pool.query(query, [userId, achievementId, JSON.stringify(progressValue)]);
      
      if (result.rows.length === 0) {
        throw new Error('Failed to award achievement');
      }
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Check and award achievements based on user progress
  static async checkAndAwardAchievements(userId, progressData) {
    try {
      const achievements = await this.findAll();
      const awardedAchievements = [];

      for (const achievement of achievements) {
        // Check if user already has this achievement
        const existingQuery = 'SELECT * FROM user_achievements WHERE user_id = $1 AND achievement_id = $2';
        const existingResult = await pool.query(existingQuery, [userId, achievement.id]);
        
        if (existingResult.rows.length > 0) {
          continue; // User already has this achievement
        }

        let shouldAward = false;
        const criteria = achievement.criteriaValue;

        switch (achievement.criteriaType) {
          case 'framework_step':
            if (criteria.step_number && progressData.completedFrameworkSteps?.includes(criteria.step_number)) {
              shouldAward = true;
            } else if (criteria.all_steps && progressData.frameworkComplete) {
              shouldAward = true;
            }
            break;

          case 'debt_paid':
            if (criteria.debt_count && progressData.paidOffDebts >= criteria.debt_count) {
              shouldAward = true;
            }
            break;

          case 'milestone_reached':
            if (criteria.percentage && progressData.debtPayoffPercentage >= criteria.percentage) {
              shouldAward = true;
            }
            break;

          case 'streak':
            if (criteria.days && progressData.paymentStreak >= criteria.days) {
              shouldAward = true;
            }
            break;

          case 'devotional_streak':
            if (criteria.days && progressData.devotionalStreak >= criteria.days) {
              shouldAward = true;
            }
            break;
        }

        if (shouldAward) {
          await this.awardAchievement(userId, achievement.id, progressData);
          awardedAchievements.push(achievement);
        }
      }

      return awardedAchievements;
    } catch (error) {
      throw error;
    }
  }

  // Get achievement statistics for a user
  static async getUserAchievementStats(userId) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_achievements,
          COUNT(CASE WHEN ua.user_id = $1 THEN 1 END) as earned_achievements,
          COALESCE(SUM(CASE WHEN ua.user_id = $1 THEN a.points END), 0) as total_points,
          ROUND(
            (COUNT(CASE WHEN ua.user_id = $1 THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
          ) as completion_percentage
        FROM achievements a
        LEFT JOIN user_achievements ua ON a.id = ua.achievement_id
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get recent achievements (last 30 days)
  static async getRecentAchievements(userId, days = 30) {
    try {
      const query = `
        SELECT a.*, ua.earned_date
        FROM achievements a
        INNER JOIN user_achievements ua ON a.id = ua.achievement_id
        WHERE ua.user_id = $1 AND ua.earned_date >= CURRENT_DATE - INTERVAL '${days} days'
        ORDER BY ua.earned_date DESC
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows.map(row => ({
        achievement: new Achievement(row),
        earnedDate: row.earned_date
      }));
    } catch (error) {
      throw error;
    }
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      iconName: this.iconName,
      criteriaType: this.criteriaType,
      criteriaValue: this.criteriaValue,
      points: this.points,
      badgeColor: this.badgeColor,
      createdAt: this.createdAt
    };
  }
}

module.exports = Achievement;

