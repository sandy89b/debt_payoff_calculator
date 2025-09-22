CREATE TABLE IF NOT EXISTS email_opens (
    id SERIAL PRIMARY KEY,
    email_send_id INTEGER REFERENCES email_sends(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    campaign_id INTEGER REFERENCES email_campaigns(id) ON DELETE SET NULL,
    template_id INTEGER REFERENCES email_templates(id) ON DELETE SET NULL,
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    UNIQUE(email_send_id)
);

-- Add columns to email_sends table for open tracking
ALTER TABLE email_sends 
ADD COLUMN IF NOT EXISTS open_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS first_opened_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_opened_at TIMESTAMP;
