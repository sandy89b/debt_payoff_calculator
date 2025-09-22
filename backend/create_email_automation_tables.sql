-- Enhanced Email Automation System Database Schema
-- This creates all necessary tables for comprehensive email automation

-- Table to track user milestones and achievements
CREATE TABLE IF NOT EXISTS user_milestones (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  milestone_type VARCHAR(50) NOT NULL, -- 'debt_paid', 'debt_milestone', 'framework_step', 'emergency_fund', etc.
  milestone_data JSONB NOT NULL, -- Flexible data storage for milestone details
  achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, milestone_type, milestone_data) -- Prevent duplicate milestones
);

-- Table to track user activities for engagement emails
CREATE TABLE IF NOT EXISTS user_activities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'debt_entry', 'calculator_used', 'pdf_export', 'goal_created', etc.
  activity_data JSONB,
  activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to store scheduled emails for delayed campaigns
CREATE TABLE IF NOT EXISTS scheduled_emails (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  campaign_id INTEGER REFERENCES email_campaigns(id) ON DELETE CASCADE,
  template_data JSONB NOT NULL,
  scheduled_for TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'cancelled'
  sent_at TIMESTAMP NULL,
  error_message TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to track email trigger events for analytics
CREATE TABLE IF NOT EXISTS email_trigger_events (
  id SERIAL PRIMARY KEY,
  trigger_event VARCHAR(50) NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  campaign_id INTEGER REFERENCES email_campaigns(id) ON DELETE SET NULL,
  event_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to track user engagement metrics
CREATE TABLE IF NOT EXISTS user_engagement_metrics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  metric_type VARCHAR(50) NOT NULL, -- 'last_login', 'debt_count', 'total_debt', 'framework_progress', etc.
  metric_value DECIMAL(15,2),
  metric_text VARCHAR(255),
  metric_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, metric_type, metric_date) -- One metric per user per day
);

-- Table to store user preferences for email frequency
CREATE TABLE IF NOT EXISTS user_email_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  welcome_emails BOOLEAN DEFAULT true,
  milestone_emails BOOLEAN DEFAULT true,
  framework_emails BOOLEAN DEFAULT true,
  engagement_emails BOOLEAN DEFAULT true,
  educational_emails BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT true,
  weekly_checkins BOOLEAN DEFAULT true,
  monthly_reports BOOLEAN DEFAULT true,
  frequency_preference VARCHAR(20) DEFAULT 'normal', -- 'minimal', 'normal', 'frequent'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_milestones_user_type ON user_milestones(user_id, milestone_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_type ON user_activities(user_id, activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_date ON user_activities(activity_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_status ON scheduled_emails(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_trigger_events_trigger ON email_trigger_events(trigger_event, created_at);
CREATE INDEX IF NOT EXISTS idx_user_engagement_metrics_user_date ON user_engagement_metrics(user_id, metric_date);

-- Function to update user engagement metrics automatically
CREATE OR REPLACE FUNCTION update_user_engagement_metric(
  p_user_id INTEGER,
  p_metric_type VARCHAR(50),
  p_metric_value DECIMAL(15,2) DEFAULT NULL,
  p_metric_text VARCHAR(255) DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_engagement_metrics (user_id, metric_type, metric_value, metric_text, metric_date, updated_at)
  VALUES (p_user_id, p_metric_type, p_metric_value, p_metric_text, CURRENT_DATE, CURRENT_TIMESTAMP)
  ON CONFLICT (user_id, metric_type, metric_date)
  DO UPDATE SET
    metric_value = EXCLUDED.metric_value,
    metric_text = EXCLUDED.metric_text,
    updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Function to record user milestone
CREATE OR REPLACE FUNCTION record_user_milestone(
  p_user_id INTEGER,
  p_milestone_type VARCHAR(50),
  p_milestone_data JSONB
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_milestones (user_id, milestone_type, milestone_data)
  VALUES (p_user_id, p_milestone_type, p_milestone_data)
  ON CONFLICT (user_id, milestone_type, milestone_data) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Function to record user activity
CREATE OR REPLACE FUNCTION record_user_activity(
  p_user_id INTEGER,
  p_activity_type VARCHAR(50),
  p_activity_data JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_activities (user_id, activity_type, activity_data)
  VALUES (p_user_id, p_activity_type, p_activity_data);
END;
$$ LANGUAGE plpgsql;

-- Insert default email preferences for existing users
INSERT INTO user_email_preferences (user_id)
SELECT id FROM users
WHERE id NOT IN (SELECT user_id FROM user_email_preferences);

-- Add some sample email campaigns for the new triggers
INSERT INTO email_campaigns (name, description, campaign_type, trigger_event, delay_days, send_time, target_criteria, is_active) VALUES
('First Debt Paid Celebration', 'Congratulate user on paying off their first debt', 'milestone', 'first_debt_paid', 0, '09:00:00', '{}', true),
('25% Debt Elimination Milestone', 'Celebrate 25% debt elimination progress', 'milestone', 'debt_milestone_25', 0, '10:00:00', '{}', true),
('50% Debt Elimination Milestone', 'Celebrate 50% debt elimination progress', 'milestone', 'debt_milestone_50', 0, '10:00:00', '{}', true),
('75% Debt Elimination Milestone', 'Celebrate 75% debt elimination progress', 'milestone', 'debt_milestone_75', 0, '10:00:00', '{}', true),
('Debt Free Achievement', 'Major celebration for becoming debt-free', 'milestone', 'debt_free', 0, '09:00:00', '{}', true),
('Framework Step Complete', 'Congratulations on completing a framework step', 'milestone', 'framework_step_complete', 0, '11:00:00', '{}', true),
('All Framework Steps Complete', 'Achievement recognition for completing all 6 steps', 'milestone', 'framework_complete', 0, '09:00:00', '{}', true),
('First Debt Entry Welcome', 'Welcome user after first debt entry', 'welcome_series', 'first_debt_entry', 0, '09:00:00', '{}', true),
('Calculator Results Follow-up', 'Follow-up after calculator use', 'reminder', 'calculator_used', 1, '10:00:00', '{}', true),
('7-Day Inactivity Re-engagement', 'Re-engage inactive users', 'reminder', 'user_inactive_7_days', 0, '14:00:00', '{}', true),
('30-Day Inactivity Win-back', 'Win back long-term inactive users', 'marketing', 'user_inactive_30_days', 0, '10:00:00', '{}', true),
('Weekly Progress Check-in', 'Weekly encouragement and progress check', 'newsletter', 'weekly_check_in', 0, '08:00:00', '{}', true),
('Monthly Progress Report', 'Monthly summary and insights', 'newsletter', 'monthly_report', 0, '09:00:00', '{}', true);
