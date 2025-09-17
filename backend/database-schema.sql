 -- The Pour & Payoff Planner™ Database Schema
-- Legacy Mindset Solutions - Debt Freedom Builder Bible

-- =============================================
-- CORE USER MANAGEMENT
-- =============================================

-- Users table (already exists, but enhanced for the new features)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255), -- Nullable for OAuth users
  google_id VARCHAR(100) UNIQUE, -- For Google OAuth users
  provider VARCHAR(20) DEFAULT 'local', -- 'local' or 'google'
  avatar_url TEXT, -- For OAuth users
  email_verified BOOLEAN DEFAULT FALSE,
  verification_code VARCHAR(6), -- six-digit code
  verification_expires_at TIMESTAMP, -- expiry for code
  
  -- Password reset fields
  password_reset_token VARCHAR(255), -- JWT token for password reset
  password_reset_expires_at TIMESTAMP, -- expiry for reset token
  
  -- User preferences and settings
  theme_preference VARCHAR(10) DEFAULT 'light', -- 'light', 'dark', 'system'
  onboarding_completed BOOLEAN DEFAULT FALSE,
  current_framework_step INTEGER DEFAULT 1, -- 1-6 for Widow's Wealth Cycle
  last_login_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User settings and preferences
CREATE TABLE IF NOT EXISTS user_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  setting_key VARCHAR(50) NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, setting_key)
);

-- =============================================
-- DEBT MANAGEMENT
-- =============================================

-- Debts table
CREATE TABLE IF NOT EXISTS debts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  balance DECIMAL(12,2) NOT NULL,
  interest_rate DECIMAL(5,4) NOT NULL, -- e.g., 0.1899 for 18.99%
  minimum_payment DECIMAL(10,2) NOT NULL,
  due_date INTEGER NOT NULL, -- Day of month (1-31)
  
  -- Debt categorization
  debt_type VARCHAR(50) DEFAULT 'credit_card', -- 'credit_card', 'loan', 'mortgage', 'other'
  priority INTEGER DEFAULT 1, -- For snowball method ordering
  
  -- Status tracking
  is_active BOOLEAN DEFAULT TRUE,
  paid_off_date DATE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment history
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  debt_id INTEGER REFERENCES debts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_type VARCHAR(20) DEFAULT 'regular', -- 'regular', 'extra', 'bonus', 'snowball'
  
  -- Payment details
  principal_amount DECIMAL(10,2),
  interest_amount DECIMAL(10,2),
  remaining_balance DECIMAL(12,2),
  
  -- Metadata
  notes TEXT,
  is_automatic BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- WIDOW'S WEALTH CYCLE™ FRAMEWORK
-- =============================================

-- Framework steps (the 6-step process)
CREATE TABLE IF NOT EXISTS framework_steps (
  id SERIAL PRIMARY KEY,
  step_number INTEGER UNIQUE NOT NULL,
  title VARCHAR(100) NOT NULL,
  subtitle VARCHAR(200),
  description TEXT,
  biblical_reference VARCHAR(50), -- e.g., "2 Kings 4:2"
  icon_name VARCHAR(50), -- For UI icons
  
  -- Step content
  instructions TEXT,
  worksheet_questions JSONB, -- Array of questions for the worksheet
  success_criteria JSONB, -- What constitutes completion
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User progress through framework steps
CREATE TABLE IF NOT EXISTS user_framework_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  step_id INTEGER REFERENCES framework_steps(id) ON DELETE CASCADE,
  
  -- Progress tracking
  is_completed BOOLEAN DEFAULT FALSE,
  completion_date TIMESTAMP,
  progress_percentage INTEGER DEFAULT 0, -- 0-100
  
  -- User responses and data
  worksheet_responses JSONB, -- User's answers to worksheet questions
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, step_id)
);

-- =============================================
-- SCENARIOS AND WHAT-IF ANALYSIS
-- =============================================

-- Saved scenarios
CREATE TABLE IF NOT EXISTS scenarios (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  scenario_type VARCHAR(50) NOT NULL, -- 'bonus', 'income_change', 'rate_change', 'custom'
  
  -- Scenario parameters
  parameters JSONB NOT NULL, -- Flexible storage for scenario data
  
  -- Results
  months_saved INTEGER,
  interest_saved DECIMAL(12,2),
  new_payoff_date DATE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- CALENDAR AND REMINDERS
-- =============================================

-- Payment reminders
CREATE TABLE IF NOT EXISTS payment_reminders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  debt_id INTEGER REFERENCES debts(id) ON DELETE CASCADE,
  
  -- Reminder details
  reminder_date DATE NOT NULL,
  reminder_time TIME DEFAULT '09:00:00',
  message TEXT,
  
  -- Reminder settings
  is_active BOOLEAN DEFAULT TRUE,
  reminder_type VARCHAR(20) DEFAULT 'email', -- 'email', 'browser', 'sms'
  days_before INTEGER DEFAULT 3, -- Days before due date
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Calendar events (milestones, goals, etc.)
CREATE TABLE IF NOT EXISTS calendar_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  
  -- Event details
  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  event_type VARCHAR(50) NOT NULL, -- 'payment_due', 'milestone', 'goal', 'reminder'
  
  -- Event metadata
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern VARCHAR(50), -- 'monthly', 'weekly', etc.
  is_completed BOOLEAN DEFAULT FALSE,
  
  -- Related entities
  related_debt_id INTEGER REFERENCES debts(id) ON DELETE SET NULL,
  related_scenario_id INTEGER REFERENCES scenarios(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- EDUCATIONAL CONTENT
-- =============================================

-- Daily devotionals
CREATE TABLE IF NOT EXISTS devotionals (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  biblical_reference VARCHAR(100),
  verse_text TEXT,
  
  -- Content metadata
  category VARCHAR(50), -- 'debt_freedom', 'stewardship', 'generosity', 'planning'
  reading_time_minutes INTEGER DEFAULT 5,
  difficulty_level VARCHAR(20) DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
  
  -- Publishing
  is_published BOOLEAN DEFAULT FALSE,
  publish_date DATE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User devotional progress
CREATE TABLE IF NOT EXISTS user_devotional_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  devotional_id INTEGER REFERENCES devotionals(id) ON DELETE CASCADE,
  
  -- Progress tracking
  is_read BOOLEAN DEFAULT FALSE,
  read_date DATE,
  reading_time_seconds INTEGER,
  
  -- User engagement
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, devotional_id)
);

-- =============================================
-- MOTIVATION AND ACHIEVEMENTS
-- =============================================

-- Achievement definitions
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_name VARCHAR(50),
  
  -- Achievement criteria
  criteria_type VARCHAR(50) NOT NULL, -- 'debt_paid', 'milestone_reached', 'streak', 'framework_step'
  criteria_value JSONB NOT NULL, -- Flexible criteria storage
  
  -- Rewards and motivation
  points INTEGER DEFAULT 0,
  badge_color VARCHAR(20) DEFAULT 'blue',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
  
  -- Achievement details
  earned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  progress_value JSONB, -- Current progress toward achievement
  
  UNIQUE(user_id, achievement_id)
);

-- =============================================
-- DATA EXPORT AND BACKUP
-- =============================================

-- Export history
CREATE TABLE IF NOT EXISTS data_exports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  
  -- Export details
  export_type VARCHAR(50) NOT NULL, -- 'pdf_report', 'csv_data', 'json_backup'
  file_name VARCHAR(200) NOT NULL,
  file_size_bytes INTEGER,
  
  -- Export content
  export_data JSONB, -- Metadata about what was exported
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider);
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users(password_reset_token);

-- Debt indexes
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON debts(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_active ON debts(is_active);
CREATE INDEX IF NOT EXISTS idx_debts_priority ON debts(priority);

-- Payment indexes
CREATE INDEX IF NOT EXISTS idx_payments_debt_id ON payments(debt_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);

-- Framework progress indexes
CREATE INDEX IF NOT EXISTS idx_framework_progress_user_id ON user_framework_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_framework_progress_step_id ON user_framework_progress(step_id);
CREATE INDEX IF NOT EXISTS idx_framework_progress_completed ON user_framework_progress(is_completed);

-- Scenario indexes
CREATE INDEX IF NOT EXISTS idx_scenarios_user_id ON scenarios(user_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_type ON scenarios(scenario_type);

-- Calendar indexes
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON payment_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_date ON payment_reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON calendar_events(event_date);

-- Devotional indexes
CREATE INDEX IF NOT EXISTS idx_devotionals_published ON devotionals(is_published);
CREATE INDEX IF NOT EXISTS idx_devotionals_date ON devotionals(publish_date);
CREATE INDEX IF NOT EXISTS idx_devotional_progress_user_id ON user_devotional_progress(user_id);

-- Achievement indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_date ON user_achievements(earned_date);

-- =============================================
-- INITIAL DATA SETUP
-- =============================================

-- Insert the 6 framework steps
INSERT INTO framework_steps (step_number, title, subtitle, description, biblical_reference, icon_name, instructions, worksheet_questions, success_criteria) VALUES
(1, 'INVENTORY', 'What''s In Your House?', 'Identify your current income, assets, skills, and untapped potential', '2 Kings 4:2', 'inventory', 'Take a complete inventory of all your resources, income sources, and potential opportunities.', 
 '["What are your current income sources?", "What assets do you own?", "What skills or talents could generate income?", "What resources are you overlooking?"]',
 '{"debt_listed": true, "income_sources_identified": true, "assets_catalogued": true}'),

(2, 'INSTRUCTION', 'Borrow With Purpose', 'Strategic, temporary borrowing—only for production, not consumption', '2 Kings 4:3', 'instruction', 'Clarify what each debt is funding and how it will produce value.', 
 '["What is each debt funding?", "How will this debt help you generate income?", "Is this debt for production or consumption?", "What is your repayment strategy?"]',
 '{"debt_purpose_clarified": true, "repayment_strategy_defined": true}'),

(3, 'IMPLEMENTATION', 'Shut the Door and Pour', 'Execution season—no distractions. Use what''s in your hand and focus.', '2 Kings 4:4', 'implementation', 'Focus on executing your plan without distractions. Use your skills and resources to generate income.', 
 '["What specific actions will you take?", "How will you eliminate distractions?", "What is your daily/weekly action plan?", "How will you track your progress?"]',
 '{"action_plan_created": true, "distractions_eliminated": true, "progress_tracking_setup": true}'),

(4, 'INCREASE', 'Let It Flow Until It Stops', 'Track your output—sales, income, side hustle revenue. Multiply what''s working.', '2 Kings 4:6', 'increase', 'Focus on multiplying what''s working and tracking your income growth.', 
 '["What income streams are working best?", "How can you scale successful activities?", "What metrics will you track?", "How will you measure growth?"]',
 '{"income_streams_identified": true, "scaling_plan_created": true, "metrics_defined": true}'),

(5, 'INCOME', 'Sell the Oil', 'Time to monetize—use your revenue to create margin. Selling is stewardship.', '2 Kings 4:7', 'income', 'Focus on monetizing your efforts and creating financial margin.', 
 '["How will you monetize your efforts?", "What is your pricing strategy?", "How will you create financial margin?", "What is your revenue goal?"]',
 '{"monetization_strategy_defined": true, "pricing_set": true, "margin_created": true}'),

(6, 'IMPACT', 'Pay Off & Live on the Rest', 'Pay off all debts and establish overflow strategy: savings, giving, reinvestment.', '2 Kings 4:7', 'impact', 'Pay off debts and establish a strategy for overflow: savings, giving, and reinvestment.', 
 '["What is your debt payoff timeline?", "How will you build emergency savings?", "What is your giving strategy?", "How will you plan for legacy?"]',
 '{"debt_payoff_plan": true, "emergency_fund_plan": true, "giving_strategy": true, "legacy_plan": true}');

-- Insert sample achievements
INSERT INTO achievements (name, description, icon_name, criteria_type, criteria_value, points, badge_color) VALUES
('First Step', 'Complete the INVENTORY step of the Widow''s Wealth Cycle', 'inventory', 'framework_step', '{"step_number": 1}', 10, 'green'),
('Strategic Thinker', 'Complete the INSTRUCTION step of the Widow''s Wealth Cycle', 'instruction', 'framework_step', '{"step_number": 2}', 15, 'blue'),
('Action Taker', 'Complete the IMPLEMENTATION step of the Widow''s Wealth Cycle', 'implementation', 'framework_step', '{"step_number": 3}', 20, 'purple'),
('Income Builder', 'Complete the INCREASE step of the Widow''s Wealth Cycle', 'increase', 'framework_step', '{"step_number": 4}', 25, 'orange'),
('Money Manager', 'Complete the INCOME step of the Widow''s Wealth Cycle', 'income', 'framework_step', '{"step_number": 5}', 30, 'red'),
('Legacy Builder', 'Complete the IMPACT step of the Widow''s Wealth Cycle', 'impact', 'framework_step', '{"step_number": 6}', 50, 'gold'),
('Debt Destroyer', 'Pay off your first debt completely', 'trophy', 'debt_paid', '{"debt_count": 1}', 100, 'gold'),
('Halfway There', 'Pay off 50% of your total debt', 'target', 'milestone_reached', '{"percentage": 50}', 75, 'silver'),
('Debt Free', 'Pay off all your debts completely', 'crown', 'milestone_reached', '{"percentage": 100}', 200, 'diamond'),
('Consistent Saver', 'Make 30 consecutive on-time payments', 'streak', 'streak', '{"days": 30}', 50, 'blue'),
('Framework Master', 'Complete all 6 steps of the Widow''s Wealth Cycle', 'star', 'framework_step', '{"all_steps": true}', 150, 'rainbow');

-- Insert sample devotionals
INSERT INTO devotionals (title, content, biblical_reference, verse_text, category, reading_time_minutes, is_published, publish_date) VALUES
('The Widow''s Faith', 'In 2 Kings 4, we see a widow facing impossible circumstances. She had nothing but a little oil, yet God used what she had to provide abundantly. This teaches us that God can multiply our small resources when we step out in faith and obedience.', '2 Kings 4:1-7', 'The widow said to Elisha, "Your servant my husband is dead, and you know that he revered the Lord. But now his creditor is coming to take my two boys as his slaves."', 'debt_freedom', 3, true, CURRENT_DATE),
('Stewardship Over Ownership', 'True wealth isn''t about owning more; it''s about stewarding well what God has entrusted to us. When we view our finances through the lens of stewardship, we make wiser decisions and experience greater peace.', '1 Chronicles 29:14', 'But who am I, and who are my people, that we should be able to give as generously as this? Everything comes from you, and we have given you only what comes from your hand.', 'stewardship', 4, true, CURRENT_DATE),
('The Power of Planning', 'Proverbs tells us that plans fail for lack of counsel, but with many advisers they succeed. Creating a debt payoff plan is an act of wisdom and faith, trusting God to guide our steps toward financial freedom.', 'Proverbs 15:22', 'Plans fail for lack of counsel, but with many advisers they succeed.', 'planning', 3, true, CURRENT_DATE),
('Generous Living', 'God loves a cheerful giver, and generosity is a key principle in biblical wealth building. Even in debt, we can practice generosity with our time, talents, and resources, trusting God to multiply our efforts.', '2 Corinthians 9:7', 'Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.', 'generosity', 4, true, CURRENT_DATE),
('Faith and Works', 'Faith without works is dead, and this applies to our finances. We must have faith that God will provide, but we also must take practical steps to manage our money wisely and eliminate debt.', 'James 2:17', 'In the same way, faith by itself, if it is not accompanied by action, is dead.', 'debt_freedom', 3, true, CURRENT_DATE);

-- =============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_debts_updated_at BEFORE UPDATE ON debts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_framework_steps_updated_at BEFORE UPDATE ON framework_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_framework_progress_updated_at BEFORE UPDATE ON user_framework_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scenarios_updated_at BEFORE UPDATE ON scenarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_reminders_updated_at BEFORE UPDATE ON payment_reminders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_devotionals_updated_at BEFORE UPDATE ON devotionals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();