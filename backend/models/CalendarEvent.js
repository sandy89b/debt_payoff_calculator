const { pool } = require('../config/database');
const emailAutomationService = require('../services/emailAutomationService');

class CalendarEvent {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.title = data.title;
    this.description = data.description;
    this.eventDate = data.event_date;
    this.eventTime = data.event_time;
    this.eventType = data.event_type;
    this.isRecurring = data.is_recurring;
    this.recurrencePattern = data.recurrence_pattern;
    this.isCompleted = data.is_completed;
    this.relatedDebtId = data.related_debt_id;
    this.relatedScenarioId = data.related_scenario_id;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Create a new calendar event
  static async create(userId, eventData) {
    try {
      const { 
        title, description, eventDate, eventTime, eventType, 
        isRecurring = false, recurrencePattern, relatedDebtId, relatedScenarioId 
      } = eventData;
      
      const query = `
        INSERT INTO calendar_events (user_id, title, description, event_date, event_time, event_type, is_recurring, recurrence_pattern, related_debt_id, related_scenario_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      
      const values = [userId, title, description, eventDate, eventTime, eventType, isRecurring, recurrencePattern, relatedDebtId, relatedScenarioId];
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Failed to create calendar event');
      }
      
      const created = new CalendarEvent(result.rows[0]);
      
      // Trigger payment reminder confirmation email when creating reminders
      try {
        if (created.eventType === 'reminder') {
          await emailAutomationService.triggerCampaignByEvent('payment_reminder_set', userId, {
            title: created.title,
            dueDate: created.eventDate,
            method: 'email'
          });
        }
      } catch (e) {
        // Do not fail creation on email issues
      }
      
      return created;
    } catch (error) {
      throw error;
    }
  }

  // Get events for a user within a date range
  static async findByDateRange(userId, startDate, endDate) {
    try {
      const query = `
        SELECT * FROM calendar_events 
        WHERE user_id = $1 AND event_date BETWEEN $2 AND $3
        ORDER BY event_date ASC, event_time ASC
      `;
      
      const result = await pool.query(query, [userId, startDate, endDate]);
      return result.rows.map(row => new CalendarEvent(row));
    } catch (error) {
      throw error;
    }
  }

  // Get events for a specific date
  static async findByDate(userId, date) {
    try {
      const query = `
        SELECT * FROM calendar_events 
        WHERE user_id = $1 AND event_date = $2
        ORDER BY event_time ASC
      `;
      
      const result = await pool.query(query, [userId, date]);
      return result.rows.map(row => new CalendarEvent(row));
    } catch (error) {
      throw error;
    }
  }

  // Get events by type
  static async findByType(userId, eventType, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT * FROM calendar_events 
        WHERE user_id = $1 AND event_type = $2
        ORDER BY event_date ASC
        LIMIT $3 OFFSET $4
      `;
      
      const result = await pool.query(query, [userId, eventType, limit, offset]);
      return result.rows.map(row => new CalendarEvent(row));
    } catch (error) {
      throw error;
    }
  }

  // Get upcoming events
  static async getUpcoming(userId, days = 30) {
    try {
      const query = `
        SELECT * FROM calendar_events 
        WHERE user_id = $1 AND event_date >= CURRENT_DATE AND event_date <= CURRENT_DATE + INTERVAL '${days} days'
        ORDER BY event_date ASC, event_time ASC
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows.map(row => new CalendarEvent(row));
    } catch (error) {
      throw error;
    }
  }

  // Get overdue events
  static async getOverdue(userId) {
    try {
      const query = `
        SELECT * FROM calendar_events 
        WHERE user_id = $1 AND event_date < CURRENT_DATE AND is_completed = false
        ORDER BY event_date ASC
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows.map(row => new CalendarEvent(row));
    } catch (error) {
      throw error;
    }
  }

  // Update an event
  static async update(eventId, userId, updateData) {
    try {
      const allowedFields = ['title', 'description', 'event_date', 'event_time', 'event_type', 'is_recurring', 'recurrence_pattern', 'is_completed'];
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

      values.push(eventId, userId);
      const query = `
        UPDATE calendar_events 
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Event not found or not owned by user');
      }
      
      return new CalendarEvent(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Mark event as completed
  static async markCompleted(eventId, userId) {
    try {
      const query = `
        UPDATE calendar_events 
        SET is_completed = true, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `;
      
      const result = await pool.query(query, [eventId, userId]);
      
      if (result.rows.length === 0) {
        throw new Error('Event not found or not owned by user');
      }
      
      return new CalendarEvent(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Delete an event
  static async delete(eventId, userId) {
    try {
      const query = 'DELETE FROM calendar_events WHERE id = $1 AND user_id = $2 RETURNING *';
      const result = await pool.query(query, [eventId, userId]);
      
      if (result.rows.length === 0) {
        throw new Error('Event not found or not owned by user');
      }
      
      return new CalendarEvent(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Generate payment reminders for debts
  static async generatePaymentReminders(userId) {
    try {
      // Get all active debts for the user
      const debtQuery = 'SELECT * FROM debts WHERE user_id = $1 AND is_active = true';
      const debtResult = await pool.query(debtQuery, [userId]);
      
      const reminders = [];
      
      for (const debt of debtResult.rows) {
        // Create reminder for next month's payment
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextMonth.setDate(debt.due_date);
        
        const reminderData = {
          title: `Payment Due: ${debt.name}`,
          description: `Minimum payment of $${debt.minimum_payment} is due`,
          eventDate: nextMonth.toISOString().split('T')[0],
          eventTime: '09:00:00',
          eventType: 'payment_due',
          relatedDebtId: debt.id
        };
        
        const reminder = await this.create(userId, reminderData);
        reminders.push(reminder);
      }
      
      return reminders;
    } catch (error) {
      throw error;
    }
  }

  // Get calendar statistics
  static async getCalendarStats(userId) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_events,
          COUNT(CASE WHEN event_type = 'payment_due' THEN 1 END) as payment_events,
          COUNT(CASE WHEN event_type = 'milestone' THEN 1 END) as milestone_events,
          COUNT(CASE WHEN event_type = 'goal' THEN 1 END) as goal_events,
          COUNT(CASE WHEN event_type = 'reminder' THEN 1 END) as reminder_events,
          COUNT(CASE WHEN is_completed = true THEN 1 END) as completed_events,
          COUNT(CASE WHEN is_completed = false AND event_date < CURRENT_DATE THEN 1 END) as overdue_events,
          COUNT(CASE WHEN event_date >= CURRENT_DATE AND event_date <= CURRENT_DATE + INTERVAL '7 days' THEN 1 END) as upcoming_week_events
        FROM calendar_events 
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
      title: this.title,
      description: this.description,
      eventDate: this.eventDate,
      eventTime: this.eventTime,
      eventType: this.eventType,
      isRecurring: this.isRecurring,
      recurrencePattern: this.recurrencePattern,
      isCompleted: this.isCompleted,
      relatedDebtId: this.relatedDebtId,
      relatedScenarioId: this.relatedScenarioId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = CalendarEvent;

