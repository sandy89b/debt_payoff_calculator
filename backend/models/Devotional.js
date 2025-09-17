const { pool } = require('../config/database');

class Devotional {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.content = data.content;
    this.biblicalReference = data.biblical_reference;
    this.verseText = data.verse_text;
    this.category = data.category;
    this.readingTimeMinutes = data.reading_time_minutes;
    this.difficultyLevel = data.difficulty_level;
    this.isPublished = data.is_published;
    this.publishDate = data.publish_date;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Get all published devotionals
  static async findPublished(limit = 50, offset = 0) {
    try {
      const query = `
        SELECT * FROM devotionals 
        WHERE is_published = true 
        ORDER BY publish_date DESC, created_at DESC
        LIMIT $1 OFFSET $2
      `;
      
      const result = await pool.query(query, [limit, offset]);
      return result.rows.map(row => new Devotional(row));
    } catch (error) {
      throw error;
    }
  }

  // Get devotionals by category
  static async findByCategory(category, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT * FROM devotionals 
        WHERE is_published = true AND category = $1
        ORDER BY publish_date DESC, created_at DESC
        LIMIT $2 OFFSET $3
      `;
      
      const result = await pool.query(query, [category, limit, offset]);
      return result.rows.map(row => new Devotional(row));
    } catch (error) {
      throw error;
    }
  }

  // Get a specific devotional
  static async findById(devotionalId) {
    try {
      const query = 'SELECT * FROM devotionals WHERE id = $1 AND is_published = true';
      const result = await pool.query(query, [devotionalId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new Devotional(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Get today's devotional (random from published)
  static async getTodaysDevotional() {
    try {
      const query = `
        SELECT * FROM devotionals 
        WHERE is_published = true 
        ORDER BY RANDOM() 
        LIMIT 1
      `;
      
      const result = await pool.query(query);
      return result.rows.length > 0 ? new Devotional(result.rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Get user's devotional progress
  static async getUserProgress(userId, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT 
          d.*,
          udp.is_read,
          udp.read_date,
          udp.reading_time_seconds,
          udp.rating,
          udp.notes,
          udp.is_favorite
        FROM devotionals d
        LEFT JOIN user_devotional_progress udp ON d.id = udp.devotional_id AND udp.user_id = $1
        WHERE d.is_published = true
        ORDER BY d.publish_date DESC, d.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      
      const result = await pool.query(query, [userId, limit, offset]);
      return result.rows.map(row => ({
        devotional: new Devotional(row),
        progress: {
          isRead: row.is_read || false,
          readDate: row.read_date,
          readingTimeSeconds: row.reading_time_seconds,
          rating: row.rating,
          notes: row.notes,
          isFavorite: row.is_favorite || false
        }
      }));
    } catch (error) {
      throw error;
    }
  }

  // Mark devotional as read
  static async markAsRead(userId, devotionalId, readingTimeSeconds = null, rating = null, notes = null) {
    try {
      const query = `
        INSERT INTO user_devotional_progress (user_id, devotional_id, is_read, read_date, reading_time_seconds, rating, notes)
        VALUES ($1, $2, true, CURRENT_DATE, $3, $4, $5)
        ON CONFLICT (user_id, devotional_id)
        DO UPDATE SET
          is_read = true,
          read_date = CURRENT_DATE,
          reading_time_seconds = COALESCE(EXCLUDED.reading_time_seconds, user_devotional_progress.reading_time_seconds),
          rating = COALESCE(EXCLUDED.rating, user_devotional_progress.rating),
          notes = COALESCE(EXCLUDED.notes, user_devotional_progress.notes)
        RETURNING *
      `;
      
      const values = [userId, devotionalId, readingTimeSeconds, rating, notes];
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Failed to mark devotional as read');
      }
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Toggle favorite status
  static async toggleFavorite(userId, devotionalId) {
    try {
      const query = `
        INSERT INTO user_devotional_progress (user_id, devotional_id, is_favorite)
        VALUES ($1, $2, true)
        ON CONFLICT (user_id, devotional_id)
        DO UPDATE SET
          is_favorite = NOT user_devotional_progress.is_favorite
        RETURNING is_favorite
      `;
      
      const result = await pool.query(query, [userId, devotionalId]);
      
      if (result.rows.length === 0) {
        throw new Error('Failed to toggle favorite status');
      }
      
      return result.rows[0].is_favorite;
    } catch (error) {
      throw error;
    }
  }

  // Get user's favorite devotionals
  static async getUserFavorites(userId, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT d.*
        FROM devotionals d
        INNER JOIN user_devotional_progress udp ON d.id = udp.devotional_id
        WHERE udp.user_id = $1 AND udp.is_favorite = true AND d.is_published = true
        ORDER BY udp.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      
      const result = await pool.query(query, [userId, limit, offset]);
      return result.rows.map(row => new Devotional(row));
    } catch (error) {
      throw error;
    }
  }

  // Get devotional reading statistics
  static async getReadingStats(userId) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_devotionals,
          COUNT(CASE WHEN udp.is_read = true THEN 1 END) as read_devotionals,
          COUNT(CASE WHEN udp.is_favorite = true THEN 1 END) as favorite_devotionals,
          COALESCE(AVG(udp.rating), 0) as average_rating,
          COALESCE(SUM(udp.reading_time_seconds), 0) as total_reading_time_seconds,
          COUNT(CASE WHEN udp.read_date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as read_this_week,
          COUNT(CASE WHEN udp.read_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as read_this_month
        FROM devotionals d
        LEFT JOIN user_devotional_progress udp ON d.id = udp.devotional_id AND udp.user_id = $1
        WHERE d.is_published = true
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get available categories
  static async getCategories() {
    try {
      const query = `
        SELECT DISTINCT category, COUNT(*) as count
        FROM devotionals 
        WHERE is_published = true AND category IS NOT NULL
        GROUP BY category
        ORDER BY category
      `;
      
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      biblicalReference: this.biblicalReference,
      verseText: this.verseText,
      category: this.category,
      readingTimeMinutes: this.readingTimeMinutes,
      difficultyLevel: this.difficultyLevel,
      isPublished: this.isPublished,
      publishDate: this.publishDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Devotional;

