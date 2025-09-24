-- Comprehensive Email Templates for All Automation Triggers
-- This creates email templates for every trigger event in the system

-- Clear existing templates (optional - remove if you want to keep existing ones)
-- DELETE FROM email_templates WHERE template_type IN ('milestone', 'welcome', 'reminder', 'newsletter', 'marketing');

-- ==================== MILESTONE EMAIL TEMPLATES ====================

-- First Debt Paid Off Template
INSERT INTO email_templates (name, subject, html_content, text_content, template_type, category, variables, is_active) VALUES
('First Debt Paid Celebration', 
'🎉 You Paid Off {{debtName}}! Your First Victory!', 
'<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>First Debt Paid!</title></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; background: linear-gradient(135deg, #4CAF50, #45a049); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
    <h1 style="margin: 0; font-size: 28px;">🎉 CONGRATULATIONS {{firstName}}! 🎉</h1>
    <h2 style="margin: 10px 0 0 0; font-size: 20px;">You Paid Off {{debtName}}!</h2>
  </div>
  
  <div style="background: #f9f9f9; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
    <h3 style="color: #4CAF50; margin-top: 0;">Your First Victory is Complete! 🏆</h3>
    <p><strong>Debt Eliminated:</strong> {{amount}}</p>
    <p><strong>Remaining Total Debt:</strong> {{remainingDebt}}</p>
    <p style="font-style: italic; color: #666;">{{encouragementMessage}}</p>
  </div>
  
  <div style="margin-bottom: 25px;">
    <h3>What This Means:</h3>
    <ul>
      <li>✅ You''ve proven you can eliminate debt</li>
      <li>✅ You''ve built momentum for the next debt</li>
      <li>✅ You''re developing the discipline for financial freedom</li>
    </ul>
  </div>
  
  <div style="background: #e8f5e8; padding: 20px; border-left: 4px solid #4CAF50; margin-bottom: 25px;">
    <h4 style="margin-top: 0; color: #2e7d32;">Biblical Encouragement:</h4>
    <p style="font-style: italic;">"She considers a field and buys it; out of her earnings she plants a vineyard." - Proverbs 31:16</p>
    <p>Like the Proverbs 31 woman, you''re wisely managing your resources and building your future!</p>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{platformUrl}}/calculator" style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Continue Your Journey →</a>
  </div>
  
  <p style="text-align: center; color: #666; font-size: 14px;">Keep going, {{firstName}}! Your debt-free future is closer than ever.</p>
</body>
</html>',
'🎉 CONGRATULATIONS {{firstName}}! 🎉

You Paid Off {{debtName}}!

Your First Victory is Complete! 🏆
- Debt Eliminated: {{amount}}
- Remaining Total Debt: {{remainingDebt}}

{{encouragementMessage}}

What This Means:
✅ You''ve proven you can eliminate debt
✅ You''ve built momentum for the next debt  
✅ You''re developing the discipline for financial freedom

Biblical Encouragement:
"She considers a field and buys it; out of her earnings she plants a vineyard." - Proverbs 31:16

Like the Proverbs 31 woman, you''re wisely managing your resources and building your future!

Continue your journey: {{platformUrl}}/calculator

Keep going, {{firstName}}! Your debt-free future is closer than ever.',
'milestone', 'debt_freedom', 
'["firstName", "debtName", "amount", "remainingDebt", "encouragementMessage", "platformUrl"]', true),

-- 25% Debt Elimination Milestone
('25% Debt Elimination Milestone', 
'🎯 {{celebrationLevel}}! You''re 25% Debt Free!', 
'<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>25% Milestone!</title></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; background: linear-gradient(135deg, #FF9800, #F57C00); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
    <h1 style="margin: 0; font-size: 28px;">🎯 {{celebrationLevel}} PROGRESS! 🎯</h1>
    <h2 style="margin: 10px 0 0 0; font-size: 20px;">{{firstName}}, You''re 25% Debt Free!</h2>
  </div>
  
  <div style="background: #fff3e0; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #FF9800;">
    <h3 style="color: #E65100; margin-top: 0;">Quarter Way to Freedom! 🚀</h3>
    <p><strong>Progress:</strong> {{percentage}}% Complete</p>
    <p><strong>Debt Eliminated:</strong> {{amount}}</p>
    <p><strong>Remaining Debt:</strong> {{remainingDebt}}</p>
    <p style="font-style: italic; color: #666; font-size: 18px;">{{encouragementMessage}}</p>
  </div>
  
  <div style="margin-bottom: 25px;">
    <h3>Your Progress Bar:</h3>
    <div style="background: #f0f0f0; height: 20px; border-radius: 10px; overflow: hidden;">
      <div style="background: linear-gradient(90deg, #4CAF50, #8BC34A); height: 100%; width: 25%; border-radius: 10px;"></div>
    </div>
    <p style="text-align: center; margin: 10px 0; font-weight: bold;">25% Complete</p>
  </div>
  
  <div style="background: #e8f5e8; padding: 20px; border-left: 4px solid #4CAF50; margin-bottom: 25px;">
    <h4 style="margin-top: 0; color: #2e7d32;">Widow''s Wealth Wisdom:</h4>
    <p style="font-style: italic;">"The plans of the diligent lead to profit as surely as haste leads to poverty." - Proverbs 21:5</p>
    <p>Your diligent planning is paying off! Keep following your debt elimination strategy.</p>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{platformUrl}}/dashboard" style="background: #FF9800; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Your Progress →</a>
  </div>
</body>
</html>',
'🎯 {{celebrationLevel}} PROGRESS! 🎯

{{firstName}}, You''re 25% Debt Free!

Quarter Way to Freedom! 🚀
- Progress: {{percentage}}% Complete
- Debt Eliminated: {{amount}}
- Remaining Debt: {{remainingDebt}}

{{encouragementMessage}}

Progress: [████████████████████████████████████████████████████████████████████████] 25%

Widow''s Wealth Wisdom:
"The plans of the diligent lead to profit as surely as haste leads to poverty." - Proverbs 21:5

Your diligent planning is paying off! Keep following your debt elimination strategy.

View your progress: {{platformUrl}}/dashboard',
'milestone', 'debt_freedom', 
'["firstName", "percentage", "amount", "remainingDebt", "encouragementMessage", "celebrationLevel", "platformUrl"]', true),

-- Framework Step Complete Template
('Framework Step Complete', 
'✅ Step {{stepNumber}} Complete: {{stepTitle}}', 
'<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Framework Step Complete!</title></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; background: linear-gradient(135deg, #2196F3, #1976D2); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
    <h1 style="margin: 0; font-size: 28px;">✅ STEP COMPLETE! ✅</h1>
    <h2 style="margin: 10px 0 0 0; font-size: 18px;">{{firstName}}, You Completed Step {{stepNumber}}</h2>
  </div>
  
  <div style="background: #e3f2fd; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #2196F3;">
    <h3 style="color: #1565C0; margin-top: 0;">{{stepTitle}} ✨</h3>
    <p><strong>Framework Progress:</strong> {{progressPercentage}}% Complete</p>
    <p>You''ve successfully completed another step in the Widow''s Wealth Cycle™ framework!</p>
  </div>
  
  <div style="margin-bottom: 25px;">
    <h3>Your Framework Progress:</h3>
    <div style="background: #f0f0f0; height: 20px; border-radius: 10px; overflow: hidden;">
      <div style="background: linear-gradient(90deg, #2196F3, #64B5F6); height: 100%; width: {{progressPercentage}}%; border-radius: 10px;"></div>
    </div>
    <p style="text-align: center; margin: 10px 0; font-weight: bold;">{{progressPercentage}}% Complete ({{stepNumber}} of 6 steps)</p>
  </div>
  
  {{#if nextStepNumber}}
  <div style="background: #fff3e0; padding: 20px; border-left: 4px solid #FF9800; margin-bottom: 25px;">
    <h4 style="margin-top: 0; color: #E65100;">Next Step:</h4>
    <p><strong>Step {{nextStepNumber}}:</strong> {{nextStepTitle}}</p>
    <p>Ready to continue your journey? Let''s tackle the next step together!</p>
  </div>
  {{/if}}
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{platformUrl}}/framework" style="background: #2196F3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Continue Framework →</a>
  </div>
</body>
</html>',
'✅ STEP COMPLETE! ✅

{{firstName}}, You Completed Step {{stepNumber}}

{{stepTitle}} ✨
Framework Progress: {{progressPercentage}}% Complete

You''ve successfully completed another step in the Widow''s Wealth Cycle™ framework!

Your Framework Progress: {{progressPercentage}}% Complete ({{stepNumber}} of 6 steps)

Next Step: Step {{nextStepNumber}}: {{nextStepTitle}}
Ready to continue your journey? Let''s tackle the next step together!

Continue framework: {{platformUrl}}/framework',
'milestone', 'framework', 
'["firstName", "stepNumber", "stepTitle", "progressPercentage", "nextStepNumber", "nextStepTitle", "platformUrl"]', true);

-- ==================== ENGAGEMENT EMAIL TEMPLATES ====================

-- First Debt Entry Welcome
INSERT INTO email_templates (name, subject, html_content, text_content, template_type, category, variables, is_active) VALUES
('First Debt Entry Welcome', 
'Welcome to Your Debt Freedom Journey, {{firstName}}!', 
'<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Welcome to Your Journey!</title></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; background: linear-gradient(135deg, #4CAF50, #45a049); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
    <h1 style="margin: 0; font-size: 28px;">🎯 Welcome {{firstName}}! 🎯</h1>
    <h2 style="margin: 10px 0 0 0; font-size: 20px;">Your Debt Freedom Journey Begins!</h2>
  </div>
  
  <div style="background: #f9f9f9; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
    <h3 style="color: #4CAF50; margin-top: 0;">Great Job Taking the First Step! 👏</h3>
    <p><strong>Debts Listed:</strong> {{debtCount}}</p>
    <p><strong>Total Debt:</strong> {{totalDebt}}</p>
    <p style="font-style: italic; color: #666; font-size: 18px;">{{encouragement}}</p>
  </div>
  
  <div style="margin-bottom: 25px;">
    <h3>What Happens Next:</h3>
    <ol style="padding-left: 20px;">
      <li><strong>{{nextStep}}</strong> - See exactly how to eliminate your debt</li>
      <li><strong>Choose Your Strategy</strong> - Snowball vs Avalanche method</li>
      <li><strong>Export Your Plan</strong> - Get a PDF roadmap to freedom</li>
      <li><strong>Track Your Progress</strong> - Celebrate every milestone</li>
    </ol>
  </div>
  
  <div style="background: #e8f5e8; padding: 20px; border-left: 4px solid #4CAF50; margin-bottom: 25px;">
    <h4 style="margin-top: 0; color: #2e7d32;">Biblical Foundation:</h4>
    <p style="font-style: italic;">"Suppose one of you wants to build a tower. Won''t you first sit down and estimate the cost to see if you have enough money to complete it?" - Luke 14:28</p>
    <p>You''re doing exactly what Jesus taught - counting the cost and making a plan!</p>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{platformUrl}}/calculator" style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Create Your Strategy →</a>
  </div>
</body>
</html>',
'🎯 Welcome {{firstName}}! 🎯
Your Debt Freedom Journey Begins!

Great Job Taking the First Step! 👏
- Debts Listed: {{debtCount}}
- Total Debt: {{totalDebt}}

{{encouragement}}

What Happens Next:
1. {{nextStep}} - See exactly how to eliminate your debt
2. Choose Your Strategy - Snowball vs Avalanche method  
3. Export Your Plan - Get a PDF roadmap to freedom
4. Track Your Progress - Celebrate every milestone

Biblical Foundation:
"Suppose one of you wants to build a tower. Won''t you first sit down and estimate the cost to see if you have enough money to complete it?" - Luke 14:28

You''re doing exactly what Jesus taught - counting the cost and making a plan!

Create your strategy: {{platformUrl}}/calculator',
'welcome_series', 'debt_freedom', 
'["firstName", "debtCount", "totalDebt", "encouragement", "nextStep", "platformUrl"]', true),

-- 7-Day Inactivity Re-engagement
('7-Day Inactivity Re-engagement', 
'{{firstName}}, Your Debt Freedom Journey is Waiting! 💪', 
'<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Your Journey is Waiting!</title></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; background: linear-gradient(135deg, #FF9800, #F57C00); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
    <h1 style="margin: 0; font-size: 28px;">💪 Don''t Give Up! 💪</h1>
    <h2 style="margin: 10px 0 0 0; font-size: 20px;">{{firstName}}, Your Journey is Waiting!</h2>
  </div>
  
  <div style="background: #fff3e0; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #FF9800;">
    <h3 style="color: #E65100; margin-top: 0;">We Miss You! 🤗</h3>
    <p>It''s been {{daysSinceLastLogin}} days since your last visit.</p>
    <p>Your last activity: {{lastActivity}}</p>
    <p style="font-style: italic; color: #666; font-size: 18px;">{{encouragement}}</p>
  </div>
  
  <div style="margin-bottom: 25px;">
    <h3>{{quickWin}} 🚀</h3>
    <p>Here''s what you can accomplish in just 5 minutes today:</p>
    <ul>
      <li>✅ Review your debt elimination plan</li>
      <li>✅ Update a payment you''ve made</li>
      <li>✅ Read one framework step</li>
      <li>✅ Set a small financial goal</li>
    </ul>
  </div>
  
  <div style="background: #e8f5e8; padding: 20px; border-left: 4px solid #4CAF50; margin-bottom: 25px;">
    <h4 style="margin-top: 0; color: #2e7d32;">Motivation Boost:</h4>
    <p style="font-style: italic;">"Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up." - Galatians 6:9</p>
    <p>Every small step forward is progress. Don''t let momentum stop you now!</p>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{platformUrl}}/dashboard" style="background: #FF9800; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Continue Your Journey →</a>
  </div>
</body>
</html>',
'💪 Don''t Give Up! 💪
{{firstName}}, Your Journey is Waiting!

We Miss You! 🤗
It''s been {{daysSinceLastLogin}} days since your last visit.
Your last activity: {{lastActivity}}

{{encouragement}}

{{quickWin}} 🚀
Here''s what you can accomplish in just 5 minutes today:
✅ Review your debt elimination plan
✅ Update a payment you''ve made  
✅ Read one framework step
✅ Set a small financial goal

Motivation Boost:
"Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up." - Galatians 6:9

Every small step forward is progress. Don''t let momentum stop you now!

Continue your journey: {{platformUrl}}/dashboard',
'reminder', 'motivation', 
'["firstName", "daysSinceLastLogin", "lastActivity", "encouragement", "quickWin", "platformUrl"]', true);

-- ==================== SCHEDULED EMAIL TEMPLATES ====================

-- Weekly Check-in
INSERT INTO email_templates (name, subject, html_content, text_content, template_type, category, variables, is_active) VALUES
('Weekly Check-in', 
'📊 Weekly Check-in: How''s Your Progress, {{firstName}}?', 
'<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Weekly Check-in</title></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; background: linear-gradient(135deg, #2196F3, #1976D2); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
    <h1 style="margin: 0; font-size: 28px;">📊 Weekly Check-in 📊</h1>
    <h2 style="margin: 10px 0 0 0; font-size: 20px;">How''s Your Progress, {{firstName}}?</h2>
  </div>
  
  <div style="background: #e3f2fd; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #2196F3;">
    <h3 style="color: #1565C0; margin-top: 0;">This Week''s Progress 📈</h3>
    <p><strong>Weekly Update:</strong> {{weeklyProgress}}</p>
    <p><strong>Overall Progress:</strong> {{totalProgress}}</p>
    <p style="font-style: italic; color: #666;">{{motivationalMessage}}</p>
  </div>
  
  <div style="background: #fff3e0; padding: 20px; border-left: 4px solid #FF9800; margin-bottom: 25px;">
    <h4 style="margin-top: 0; color: #E65100;">💡 This Week''s Tip:</h4>
    <p>{{weeklyTip}}</p>
  </div>
  
  <div style="background: #e8f5e8; padding: 20px; border-left: 4px solid #4CAF50; margin-bottom: 25px;">
    <h4 style="margin-top: 0; color: #2e7d32;">📖 Weekly Verse:</h4>
    <p style="font-style: italic;">{{biblicalVerse}}</p>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{platformUrl}}/dashboard" style="background: #2196F3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Update Your Progress →</a>
  </div>
  
  <p style="text-align: center; color: #666; font-size: 14px;">Keep up the great work, {{firstName}}! Every step forward counts.</p>
</body>
</html>',
'📊 Weekly Check-in 📊
How''s Your Progress, {{firstName}}?

This Week''s Progress 📈
- Weekly Update: {{weeklyProgress}}
- Overall Progress: {{totalProgress}}

{{motivationalMessage}}

💡 This Week''s Tip:
{{weeklyTip}}

📖 Weekly Verse:
{{biblicalVerse}}

Update your progress: {{platformUrl}}/dashboard

Keep up the great work, {{firstName}}! Every step forward counts.',
'newsletter', 'motivation', 
'["firstName", "weeklyProgress", "totalProgress", "motivationalMessage", "weeklyTip", "biblicalVerse", "platformUrl"]', true);

-- Update the campaigns to use the correct template IDs
UPDATE email_campaigns SET template_id = (SELECT id FROM email_templates WHERE name = 'First Debt Paid Celebration' LIMIT 1) WHERE trigger_event = 'first_debt_paid';
UPDATE email_campaigns SET template_id = (SELECT id FROM email_templates WHERE name = '25% Debt Elimination Milestone' LIMIT 1) WHERE trigger_event = 'debt_milestone_25';
UPDATE email_campaigns SET template_id = (SELECT id FROM email_templates WHERE name = 'Framework Step Complete' LIMIT 1) WHERE trigger_event = 'framework_step_complete';
UPDATE email_campaigns SET template_id = (SELECT id FROM email_templates WHERE name = 'First Debt Entry Welcome' LIMIT 1) WHERE trigger_event = 'first_debt_entry';
UPDATE email_campaigns SET template_id = (SELECT id FROM email_templates WHERE name = '7-Day Inactivity Re-engagement' LIMIT 1) WHERE trigger_event = 'user_inactive_7_days';
UPDATE email_campaigns SET template_id = (SELECT id FROM email_templates WHERE name = 'Weekly Check-in' LIMIT 1) WHERE trigger_event = 'weekly_check_in';

-- Emergency Fund templates (idempotent inserts)
INSERT INTO email_templates (name, subject, html_content, text_content, template_type, category, variables)
SELECT 'EF $500 Milestone', 'Emergency Fund Milestone: $500 Saved! 🎉',
  '<p>Great start, {{firstName}}! You''ve saved your first $500 for emergencies.</p><p>Current Fund: {{currentFund}} / Target: {{targetFund}}</p>',
  'Great start, {{firstName}}! You''ve saved your first $500. Current: {{currentFund}} Target: {{targetFund}}',
  'milestone', 'emergency_fund', '["firstName","currentFund","targetFund"]'
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE name = 'EF $500 Milestone');

INSERT INTO email_templates (name, subject, html_content, text_content, template_type, category, variables)
SELECT 'EF $1000 Milestone', 'Emergency Fund Milestone: $1,000 Saved! 🎉',
  '<p>Way to go, {{firstName}}! You''ve hit $1,000 in your emergency fund.</p><p>Current: {{currentFund}} / Target: {{targetFund}}</p>',
  'Way to go, {{firstName}}! You''ve hit $1,000. Current: {{currentFund}} Target: {{targetFund}}',
  'milestone', 'emergency_fund', '["firstName","currentFund","targetFund"]'
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE name = 'EF $1000 Milestone');

INSERT INTO email_templates (name, subject, html_content, text_content, template_type, category, variables)
SELECT 'EF Fully Funded', 'Emergency Fund Fully Funded! 🛡️',
  '<p>Amazing, {{firstName}}! Your emergency fund is fully funded.</p><p>Current: {{currentFund}} / Target: {{targetFund}}</p>',
  'Amazing, {{firstName}}! Emergency fund fully funded. Current: {{currentFund}} Target: {{targetFund}}',
  'milestone', 'emergency_fund', '["firstName","currentFund","targetFund"]'
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE name = 'EF Fully Funded');

-- Campaigns for EF milestones
INSERT INTO email_campaigns (name, description, campaign_type, trigger_event, template_id, target_criteria, is_active, created_at)
SELECT 'Emergency Fund: $500', 'Celebration when EF hits $500', 'milestone', 'ef_500', (SELECT id FROM email_templates WHERE name = 'EF $500 Milestone'), '{}', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM email_campaigns WHERE trigger_event = 'ef_500');

INSERT INTO email_campaigns (name, description, campaign_type, trigger_event, template_id, target_criteria, is_active, created_at)
SELECT 'Emergency Fund: $1000', 'Celebration when EF hits $1000', 'milestone', 'ef_1000', (SELECT id FROM email_templates WHERE name = 'EF $1000 Milestone'), '{}', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM email_campaigns WHERE trigger_event = 'ef_1000');

INSERT INTO email_campaigns (name, description, campaign_type, trigger_event, template_id, target_criteria, is_active, created_at)
SELECT 'Emergency Fund: Fully Funded', 'Celebration when EF is fully funded', 'milestone', 'ef_full', (SELECT id FROM email_templates WHERE name = 'EF Fully Funded'), '{}', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM email_campaigns WHERE trigger_event = 'ef_full');

-- Payment reminder set confirmation
INSERT INTO email_templates (name, subject, html_content, text_content, template_type, category, variables)
SELECT 'Payment Reminder Set', 'Payment Reminder Scheduled: {{title}}',
  '<p>Your reminder has been scheduled.</p><p>{{title}} on {{dueDate}} via {{method}}.</p>',
  'Your reminder has been scheduled: {{title}} on {{dueDate}} via {{method}}',
  'reminder', 'calendar', '["title","dueDate","method"]'
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE name = 'Payment Reminder Set');

INSERT INTO email_campaigns (name, description, campaign_type, trigger_event, template_id, target_criteria, is_active, created_at)
SELECT 'Payment Reminder Set', 'Confirmation when a user schedules a reminder', 'reminder', 'payment_reminder_set', (SELECT id FROM email_templates WHERE name = 'Payment Reminder Set'), '{}', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM email_campaigns WHERE trigger_event = 'payment_reminder_set');