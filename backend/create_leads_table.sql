-- Create leads table for CRM functionality
-- This table stores leads captured from the debt calculator

CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  
  -- Debt information captured from calculator
  total_debt DECIMAL(12,2) DEFAULT 0,
  total_min_payments DECIMAL(12,2) DEFAULT 0,
  extra_payment DECIMAL(12,2) DEFAULT 0,
  debt_count INTEGER DEFAULT 0,
  calculation_results JSONB, -- Store the full calculation results
  
  -- Lead management
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'nurturing', 'converted', 'lost')),
  source VARCHAR(50) DEFAULT 'debt_calculator',
  
  -- User conversion tracking
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  converted_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_leads_updated_at ON leads;
CREATE TRIGGER trigger_update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_leads_updated_at();

-- Add some sample data for testing (optional)
-- INSERT INTO leads (first_name, last_name, email, total_debt, total_min_payments, extra_payment, debt_count, status, source)
-- VALUES 
--   ('John', 'Doe', 'john.doe@example.com', 25000.00, 750.00, 200.00, 3, 'new', 'debt_calculator'),
--   ('Jane', 'Smith', 'jane.smith@example.com', 15000.00, 450.00, 100.00, 2, 'nurturing', 'debt_calculator');
