-- Create lead email log table for tracking lead nurturing emails
-- This table tracks which emails have been sent to leads

CREATE TABLE IF NOT EXISTS lead_email_log (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  trigger_event VARCHAR(50) NOT NULL,
  template_id INTEGER REFERENCES email_templates(id) ON DELETE SET NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  email_address VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lead_email_log_lead_id ON lead_email_log(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_email_log_trigger_event ON lead_email_log(trigger_event);
CREATE INDEX IF NOT EXISTS idx_lead_email_log_sent_at ON lead_email_log(sent_at);
CREATE INDEX IF NOT EXISTS idx_lead_email_log_status ON lead_email_log(status);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_lead_email_log_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_lead_email_log_updated_at ON lead_email_log;
CREATE TRIGGER trigger_update_lead_email_log_updated_at
    BEFORE UPDATE ON lead_email_log
    FOR EACH ROW
    EXECUTE FUNCTION update_lead_email_log_updated_at();
