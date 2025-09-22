-- Create email campaigns for debt milestone events with campaign_type
-- These campaigns connect trigger events to email templates

-- First Debt Paid Off Campaign
INSERT INTO email_campaigns (name, description, campaign_type, trigger_event, template_id, target_criteria, is_active, created_at) VALUES
('First Debt Paid Off Celebration',
'Congratulatory email sent when user pays off their very first debt',
'trigger_based',
'first_debt_paid',
(SELECT id FROM email_templates WHERE name = 'first_debt_paid'),
'{}',
true,
CURRENT_TIMESTAMP);

-- 25% Debt Milestone Campaign  
INSERT INTO email_campaigns (name, description, campaign_type, trigger_event, template_id, target_criteria, is_active, created_at) VALUES
('25% Debt-Free Milestone',
'Celebration email when user reaches 25% debt-free progress',
'trigger_based',
'debt_milestone_25', 
(SELECT id FROM email_templates WHERE name = 'debt_milestone_25'),
'{}',
true,
CURRENT_TIMESTAMP);

-- 50% Debt Milestone Campaign
INSERT INTO email_campaigns (name, description, campaign_type, trigger_event, template_id, target_criteria, is_active, created_at) VALUES
('50% Debt-Free Milestone',
'Celebration email when user reaches 50% debt-free progress',
'trigger_based',
'debt_milestone_50',
(SELECT id FROM email_templates WHERE name = 'debt_milestone_50'), 
'{}',
true,
CURRENT_TIMESTAMP);

-- Complete Debt Freedom Campaign
INSERT INTO email_campaigns (name, description, campaign_type, trigger_event, template_id, target_criteria, is_active, created_at) VALUES
('Complete Debt Freedom Celebration',
'Ultimate celebration email when user becomes 100% debt-free',
'trigger_based',
'debt_free',
(SELECT id FROM email_templates WHERE name = 'debt_free'),
'{}', 
true,
CURRENT_TIMESTAMP);
