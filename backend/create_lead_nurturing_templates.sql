-- Lead Nurturing Email Templates for Phase 2 CRM
-- These templates are specifically designed to nurture leads who haven't converted yet

-- ==================== LEAD NURTURING EMAIL TEMPLATES ====================

-- Lead Welcome Email (immediate)
INSERT INTO email_templates (name, subject, html_content, text_content, template_type, category, variables, is_active) VALUES
('Lead Welcome Email', 
'Welcome to Your Debt Freedom Journey, {{firstName}}! 🎯', 
'<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Welcome to Your Journey!</title></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; background: linear-gradient(135deg, #4CAF50, #45a049); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
    <h1 style="margin: 0; font-size: 28px;">🎯 Welcome {{firstName}}! 🎯</h1>
    <h2 style="margin: 10px 0 0 0; font-size: 20px;">Your Debt Freedom Journey Begins!</h2>
  </div>
  
  <div style="background: #f9f9f9; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
    <h3 style="color: #4CAF50; margin-top: 0;">Thank You for Taking the First Step! 👏</h3>
    <p><strong>Your Debt Analysis:</strong></p>
    <ul>
      <li>Total Debt: <strong>{{totalDebt}}</strong></li>
      <li>Number of Debts: <strong>{{debtCount}}</strong></li>
      <li>Monthly Minimum Payments: <strong>{{totalMinPayments}}</strong></li>
      <li>Extra Payment Capacity: <strong>{{extraPayment}}</strong></li>
    </ul>
    <p style="font-style: italic; color: #666; font-size: 18px;">{{encouragementMessage}}</p>
  </div>
  
  <div style="margin-bottom: 25px;">
    <h3>What You''ve Accomplished:</h3>
    <ol style="padding-left: 20px;">
      <li><strong>Faced Your Reality</strong> - You''ve honestly assessed your debt situation</li>
      <li><strong>Created a Plan</strong> - You''ve seen your personalized payoff strategies</li>
      <li><strong>Found Hope</strong> - You now know exactly when you''ll be debt-free</li>
      <li><strong>Taken Action</strong> - You''re ready to start your journey</li>
    </ol>
  </div>
  
  <div style="background: #e8f5e8; padding: 20px; border-left: 4px solid #4CAF50; margin-bottom: 25px;">
    <h4 style="margin-top: 0; color: #2e7d32;">Biblical Foundation:</h4>
    <p style="font-style: italic;">"Suppose one of you wants to build a tower. Won''t you first sit down and estimate the cost to see if you have enough money to complete it?" - Luke 14:28</p>
    <p>You''re doing exactly what Jesus taught - counting the cost and making a plan!</p>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{platformUrl}}/auth/signup" style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Create Your Free Account →</a>
  </div>
  
  <div style="background: #fff3e0; padding: 20px; border-left: 4px solid #FF9800; margin-bottom: 25px;">
    <h4 style="margin-top: 0; color: #E65100;">Why Create an Account?</h4>
    <ul>
      <li>✅ Save your progress and access it anytime</li>
      <li>✅ Track payments and see real progress</li>
      <li>✅ Receive monthly progress reports</li>
      <li>✅ Get your printable payoff plan</li>
      <li>✅ Access biblical financial wisdom</li>
    </ul>
  </div>
  
  <p style="text-align: center; color: #666; font-size: 14px;">Your debt-free future starts with the next step, {{firstName}}!</p>
</body>
</html>',
'🎯 Welcome {{firstName}}! 🎯
Your Debt Freedom Journey Begins!

Thank You for Taking the First Step! 👏

Your Debt Analysis:
- Total Debt: {{totalDebt}}
- Number of Debts: {{debtCount}}
- Monthly Minimum Payments: {{totalMinPayments}}
- Extra Payment Capacity: {{extraPayment}}

{{encouragementMessage}}

What You''ve Accomplished:
1. Faced Your Reality - You''ve honestly assessed your debt situation
2. Created a Plan - You''ve seen your personalized payoff strategies
3. Found Hope - You now know exactly when you''ll be debt-free
4. Taken Action - You''re ready to start your journey

Biblical Foundation:
"Suppose one of you wants to build a tower. Won''t you first sit down and estimate the cost to see if you have enough money to complete it?" - Luke 14:28

You''re doing exactly what Jesus taught - counting the cost and making a plan!

Create your free account: {{platformUrl}}/auth/signup

Why Create an Account?
✅ Save your progress and access it anytime
✅ Track payments and see real progress
✅ Receive monthly progress reports
✅ Get your printable payoff plan
✅ Access biblical financial wisdom

Your debt-free future starts with the next step, {{firstName}}!',
'lead_nurturing', 'welcome', 
'["firstName", "totalDebt", "debtCount", "totalMinPayments", "extraPayment", "encouragementMessage", "platformUrl"]', true),

-- Day 3 Follow-up
('Lead Day 3 Follow-up', 
'{{firstName}}, Your Debt Freedom Plan is Ready! 📋', 
'<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Your Plan is Ready!</title></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; background: linear-gradient(135deg, #2196F3, #1976D2); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
    <h1 style="margin: 0; font-size: 28px;">📋 Your Plan is Ready! 📋</h1>
    <h2 style="margin: 10px 0 0 0; font-size: 20px;">{{firstName}}, Let''s Make It Official</h2>
  </div>
  
  <div style="background: #e3f2fd; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #2196F3;">
    <h3 style="color: #1565C0; margin-top: 0;">Your Personalized Debt Freedom Plan 📊</h3>
    <p><strong>Snowball Method:</strong> {{snowballMonths}} months to debt-free</p>
    <p><strong>Avalanche Method:</strong> {{avalancheMonths}} months to debt-free</p>
    <p><strong>Total Interest Saved:</strong> {{interestSaved}}</p>
    <p style="font-style: italic; color: #666;">{{motivationalMessage}}</p>
  </div>
  
  <div style="margin-bottom: 25px;">
    <h3>What''s Next in Your Journey:</h3>
    <ol style="padding-left: 20px;">
      <li><strong>Create Your Account</strong> - Save your plan and track progress</li>
      <li><strong>Start Making Payments</strong> - Follow your chosen strategy</li>
      <li><strong>Track Your Progress</strong> - Celebrate every milestone</li>
      <li><strong>Stay Motivated</strong> - Get weekly encouragement emails</li>
    </ol>
  </div>
  
  <div style="background: #fff3e0; padding: 20px; border-left: 4px solid #FF9800; margin-bottom: 25px;">
    <h4 style="margin-top: 0; color: #E65100;">💡 Pro Tip:</h4>
    <p>{{proTip}}</p>
  </div>
  
  <div style="background: #e8f5e8; padding: 20px; border-left: 4px solid #4CAF50; margin-bottom: 25px;">
    <h4 style="margin-top: 0; color: #2e7d32;">Biblical Wisdom:</h4>
    <p style="font-style: italic;">"The plans of the diligent lead to profit as surely as haste leads to poverty." - Proverbs 21:5</p>
    <p>Your plan is your roadmap to financial freedom. Now it''s time to follow it!</p>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{platformUrl}}/auth/signup" style="background: #2196F3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Create Your Account →</a>
  </div>
  
  <p style="text-align: center; color: #666; font-size: 14px;">Don''t let another day pass without taking action, {{firstName}}!</p>
</body>
</html>',
'📋 Your Plan is Ready! 📋
{{firstName}}, Let''s Make It Official

Your Personalized Debt Freedom Plan 📊
- Snowball Method: {{snowballMonths}} months to debt-free
- Avalanche Method: {{avalancheMonths}} months to debt-free
- Total Interest Saved: {{interestSaved}}

{{motivationalMessage}}

What''s Next in Your Journey:
1. Create Your Account - Save your plan and track progress
2. Start Making Payments - Follow your chosen strategy
3. Track Your Progress - Celebrate every milestone
4. Stay Motivated - Get weekly encouragement emails

💡 Pro Tip:
{{proTip}}

Biblical Wisdom:
"The plans of the diligent lead to profit as surely as haste leads to poverty." - Proverbs 21:5

Your plan is your roadmap to financial freedom. Now it''s time to follow it!

Create your account: {{platformUrl}}/auth/signup

Don''t let another day pass without taking action, {{firstName}}!',
'lead_nurturing', 'follow_up', 
'["firstName", "snowballMonths", "avalancheMonths", "interestSaved", "motivationalMessage", "proTip", "platformUrl"]', true),

-- Day 7 Follow-up
('Lead Day 7 Follow-up', 
'{{firstName}}, Don''t Let Your Plan Gather Dust! 🚀', 
'<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Don''t Let Your Plan Gather Dust!</title></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; background: linear-gradient(135deg, #FF9800, #F57C00); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
    <h1 style="margin: 0; font-size: 28px;">🚀 Don''t Let Your Plan Gather Dust! 🚀</h1>
    <h2 style="margin: 10px 0 0 0; font-size: 20px;">{{firstName}}, It''s Time to Take Action</h2>
  </div>
  
  <div style="background: #fff3e0; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #FF9800;">
    <h3 style="color: #E65100; margin-top: 0;">Your Plan is Waiting for You! ⏰</h3>
    <p>It''s been 7 days since you created your debt freedom plan.</p>
    <p><strong>Every day you wait costs you:</strong></p>
    <ul>
      <li>💰 <strong>{{dailyInterestCost}}</strong> in interest charges</li>
      <li>⏰ <strong>1 day</strong> longer in debt</li>
      <li>💪 <strong>Momentum</strong> that could be building</li>
    </ul>
    <p style="font-style: italic; color: #666;">{{urgencyMessage}}</p>
  </div>
  
  <div style="margin-bottom: 25px;">
    <h3>Success Stories from People Like You:</h3>
    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
      <p style="font-style: italic;">"I was skeptical at first, but following the plan helped me pay off $15,000 in 18 months!"</p>
      <p style="text-align: right; font-weight: bold;">- Sarah M.</p>
    </div>
    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
      <p style="font-style: italic;">"The snowball method gave me the motivation I needed. I''m now debt-free!"</p>
      <p style="text-align: right; font-weight: bold;">- Michael R.</p>
    </div>
  </div>
  
  <div style="background: #e8f5e8; padding: 20px; border-left: 4px solid #4CAF50; margin-bottom: 25px;">
    <h4 style="margin-top: 0; color: #2e7d32;">Biblical Encouragement:</h4>
    <p style="font-style: italic;">"Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up." - Galatians 6:9</p>
    <p>Every small step forward is progress. Don''t let momentum stop you now!</p>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{platformUrl}}/auth/signup" style="background: #FF9800; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Start Your Journey Today →</a>
  </div>
  
  <p style="text-align: center; color: #666; font-size: 14px;">Your debt-free future is waiting, {{firstName}}. Don''t keep it waiting!</p>
</body>
</html>',
'🚀 Don''t Let Your Plan Gather Dust! 🚀
{{firstName}}, It''s Time to Take Action

Your Plan is Waiting for You! ⏰
It''s been 7 days since you created your debt freedom plan.

Every day you wait costs you:
💰 {{dailyInterestCost}} in interest charges
⏰ 1 day longer in debt
💪 Momentum that could be building

{{urgencyMessage}}

Success Stories from People Like You:
"I was skeptical at first, but following the plan helped me pay off $15,000 in 18 months!" - Sarah M.

"The snowball method gave me the motivation I needed. I''m now debt-free!" - Michael R.

Biblical Encouragement:
"Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up." - Galatians 6:9

Every small step forward is progress. Don''t let momentum stop you now!

Start your journey today: {{platformUrl}}/auth/signup

Your debt-free future is waiting, {{firstName}}. Don''t keep it waiting!',
'lead_nurturing', 'follow_up', 
'["firstName", "dailyInterestCost", "urgencyMessage", "platformUrl"]', true),

-- Day 14 Follow-up
('Lead Day 14 Follow-up', 
'{{firstName}}, Last Chance to Start Your Debt Freedom Journey! ⚡', 
'<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Last Chance!</title></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; background: linear-gradient(135deg, #F44336, #D32F2F); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
    <h1 style="margin: 0; font-size: 28px;">⚡ Last Chance! ⚡</h1>
    <h2 style="margin: 10px 0 0 0; font-size: 20px;">{{firstName}}, Don''t Miss This Opportunity</h2>
  </div>
  
  <div style="background: #ffebee; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #F44336;">
    <h3 style="color: #C62828; margin-top: 0;">This is Your Final Reminder 🚨</h3>
    <p>We''ve been reaching out because we believe in your potential for financial freedom.</p>
    <p><strong>What you''ve already accomplished:</strong></p>
    <ul>
      <li>✅ Created a personalized debt elimination plan</li>
      <li>✅ Identified your fastest path to debt freedom</li>
      <li>✅ Calculated exactly how much you''ll save</li>
      <li>✅ Seen your debt-free date</li>
    </ul>
    <p style="font-style: italic; color: #666;">{{finalMessage}}</p>
  </div>
  
  <div style="background: #e8f5e8; padding: 20px; border-left: 4px solid #4CAF50; margin-bottom: 25px;">
    <h4 style="margin-top: 0; color: #2e7d32;">Special Offer - Limited Time:</h4>
    <p><strong>Create your account today and get:</strong></p>
    <ul>
      <li>🎁 <strong>Free PDF Export</strong> of your complete debt freedom plan</li>
      <li>🎁 <strong>Priority Support</strong> for your first 30 days</li>
      <li>🎁 <strong>Exclusive Access</strong> to our biblical financial wisdom series</li>
    </ul>
  </div>
  
  <div style="background: #e3f2fd; padding: 20px; border-left: 4px solid #2196F3; margin-bottom: 25px;">
    <h4 style="margin-top: 0; color: #1565C0;">What Happens If You Don''t Act:</h4>
    <p>Without a plan, you''ll continue:</p>
    <ul>
      <li>❌ Paying unnecessary interest</li>
      <li>❌ Feeling overwhelmed by debt</li>
      <li>❌ Missing opportunities to build wealth</li>
      <li>❌ Living with financial stress</li>
    </ul>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{platformUrl}}/auth/signup" style="background: #F44336; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Claim Your Free Account Now →</a>
  </div>
  
  <p style="text-align: center; color: #666; font-size: 14px;">This is your moment, {{firstName}}. Don''t let it pass.</p>
</body>
</html>',
'⚡ Last Chance! ⚡
{{firstName}}, Don''t Miss This Opportunity

This is Your Final Reminder 🚨
We''ve been reaching out because we believe in your potential for financial freedom.

What you''ve already accomplished:
✅ Created a personalized debt elimination plan
✅ Identified your fastest path to debt freedom
✅ Calculated exactly how much you''ll save
✅ Seen your debt-free date

{{finalMessage}}

Special Offer - Limited Time:
Create your account today and get:
🎁 Free PDF Export of your complete debt freedom plan
🎁 Priority Support for your first 30 days
🎁 Exclusive Access to our biblical financial wisdom series

What Happens If You Don''t Act:
Without a plan, you''ll continue:
❌ Paying unnecessary interest
❌ Feeling overwhelmed by debt
❌ Missing opportunities to build wealth
❌ Living with financial stress

Claim your free account now: {{platformUrl}}/auth/signup

This is your moment, {{firstName}}. Don''t let it pass.',
'lead_nurturing', 'final_reminder', 
'["firstName", "finalMessage", "platformUrl"]', true);

-- ==================== LEAD NURTURING CAMPAIGNS ====================

-- Lead Welcome Campaign (immediate)
INSERT INTO email_campaigns (name, description, campaign_type, trigger_event, template_id, target_criteria, is_active, created_at) VALUES
('Lead Welcome Campaign', 'Welcome email sent immediately when a lead is captured', 'lead_nurturing', 'lead_captured', 
(SELECT id FROM email_templates WHERE name = 'Lead Welcome Email' LIMIT 1), '{}', true, NOW()),

-- Day 3 Follow-up Campaign
('Lead Day 3 Follow-up', 'Follow-up email sent 3 days after lead capture', 'lead_nurturing', 'lead_day_3', 
(SELECT id FROM email_templates WHERE name = 'Lead Day 3 Follow-up' LIMIT 1), '{}', true, NOW()),

-- Day 7 Follow-up Campaign
('Lead Day 7 Follow-up', 'Follow-up email sent 7 days after lead capture', 'lead_nurturing', 'lead_day_7', 
(SELECT id FROM email_templates WHERE name = 'Lead Day 7 Follow-up' LIMIT 1), '{}', true, NOW()),

-- Day 14 Final Reminder Campaign
('Lead Day 14 Final Reminder', 'Final reminder email sent 14 days after lead capture', 'lead_nurturing', 'lead_day_14', 
(SELECT id FROM email_templates WHERE name = 'Lead Day 14 Follow-up' LIMIT 1), '{}', true, NOW());
