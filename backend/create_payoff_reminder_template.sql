-- Create email template and campaign for debt payoff reminders
-- This is triggered when system detects a debt balance has reached zero

-- Create the email template
INSERT INTO email_templates (name, subject, html_content, text_content, template_type, category, variables, is_active) VALUES
('debt_payoff_reminder',
'🎉 Your {{debtName}} Balance Reached $0 - Time to Celebrate!',
'<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 30px; text-align: center;">
    <h1>🎉 AMAZING NEWS! 🎉</h1>
    <h2>Your {{debtName}} Balance Reached $0!</h2>
</div>

<div style="padding: 30px; background: #f8f9fa;">
    <p>Dear {{firstName}},</p>
    
    <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0;">
        <h3>🎯 Debt Balance Alert!</h3>
        <p><strong>Your "{{debtName}}" debt has reached a $0 balance!</strong></p>
        <p>Balance reached zero on: <strong>{{balanceReachedDate}}</strong></p>
        <p>Original debt amount: <strong>{{amount}}</strong></p>
    </div>
    
    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
        <p><strong>Action Required:</strong></p>
        <p>Please log into your account and officially mark this debt as <strong>"PAID OFF"</strong> to:</p>
        <ul>
            <li>✅ Celebrate this incredible achievement</li>
            <li>📊 Update your debt freedom progress</li>
            <li>💰 See your new available cash flow</li>
            <li>🎊 Unlock your celebration email</li>
        </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="{{loginUrl}}" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            🎉 Mark as PAID OFF Now! 🎉
        </a>
    </div>
    
    <div style="background: #e9ecef; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <p><strong>💡 Pro Tip:</strong> Once you mark this debt as paid off, take that monthly payment amount and apply it to your next debt! This is the power of the debt snowball method! 🚀</p>
    </div>
    
    <blockquote style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; font-style: italic;">
        <p><strong>"The rich rule over the poor, and the borrower is slave to the lender."</strong></p>
        <p style="text-align: right;">- Proverbs 22:7</p>
        <p>You are breaking free from financial bondage, one debt at a time! 🙌</p>
    </blockquote>
</div>

<div style="text-align: center; color: #6c757d; padding: 20px;">
    <p>Celebrating your progress! 🎊</p>
    <p><strong>Legacy Mindset Solutions</strong><br>
    Harmony in Finance, Harmony in Life</p>
</div>
</body></html>',
'🎉 AMAZING NEWS! 🎉
Your {{debtName}} Balance Reached $0!

Dear {{firstName}},

🎯 Debt Balance Alert!
Your "{{debtName}}" debt has reached a $0 balance!
Balance reached zero on: {{balanceReachedDate}}
Original debt amount: {{amount}}

Action Required:
Please log into your account and officially mark this debt as "PAID OFF" to:
✅ Celebrate this incredible achievement
📊 Update your debt freedom progress  
💰 See your new available cash flow
🎊 Unlock your celebration email

💡 Pro Tip: Once you mark this debt as paid off, take that monthly payment amount and apply it to your next debt! This is the power of the debt snowball method! 🚀

"The rich rule over the poor, and the borrower is slave to the lender." - Proverbs 22:7
You are breaking free from financial bondage, one debt at a time! 🙌

Celebrating your progress! 🎊
Legacy Mindset Solutions
Harmony in Finance, Harmony in Life',
'reminder',
'debt_freedom',
'["userName", "debtName", "amount", "balanceReachedDate", "loginUrl"]',
true);

-- Create the email campaign for debt payoff reminders
INSERT INTO email_campaigns (name, description, campaign_type, trigger_event, template_id, target_criteria, is_active, created_at) VALUES
('Debt Payoff Reminder Campaign',
'Automated reminder sent when system detects a debt balance has reached zero',
'trigger_based',
'debt_payoff_reminder',
(SELECT id FROM email_templates WHERE name = 'debt_payoff_reminder'),
'{}',
true,
CURRENT_TIMESTAMP);
