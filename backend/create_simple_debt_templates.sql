-- Create simple debt milestone email templates
-- Insert debt milestone email templates

INSERT INTO email_templates (name, subject, html_content, text_content, template_type, category, variables, is_active) VALUES
('first_debt_paid', 
'Congratulations! You Just Paid Off Your First Debt!',
'<html><body>
<h1>Congratulations!</h1>
<p>Dear {{userName}},</p>
<p><strong>Amazing news!</strong> You just paid off <strong>{{debtName}}</strong> - your first step toward complete financial freedom!</p>
<h2>Amount Paid Off: {{amount}}</h2>
<p>You are {{percentage}}% closer to being completely debt-free!</p>
<p>Remaining debt: {{remainingDebt}}</p>
<blockquote>
<p>"The rich rule over the poor, and the borrower is slave to the lender." - Proverbs 22:7</p>
<p>You just broke one chain of financial bondage!</p>
</blockquote>
<h3>Keep the momentum going:</h3>
<ul>
<li>Celebrate this victory - You deserve it!</li>
<li>Apply the same payment to your next debt</li>
<li>Stay focused on your debt freedom journey</li>
</ul>
<p>Celebrating your victory!</p>
<p><strong>Legacy Mindset Solutions</strong></p>
</body></html>',
'Congratulations! You Just Paid Off Your First Debt!

Dear {{userName}},

Amazing news! You just paid off {{debtName}} - your first step toward complete financial freedom!

Amount Paid Off: {{amount}}
You are {{percentage}}% closer to being completely debt-free!
Remaining debt: {{remainingDebt}}

"The rich rule over the poor, and the borrower is slave to the lender." - Proverbs 22:7
You just broke one chain of financial bondage!

Keep the momentum going:
- Celebrate this victory - You deserve it!
- Apply the same payment to your next debt  
- Stay focused on your debt freedom journey

Celebrating your victory!
Legacy Mindset Solutions',
'milestone',
'debt_freedom',
'["userName", "debtName", "amount", "percentage", "remainingDebt"]',
true);

INSERT INTO email_templates (name, subject, html_content, text_content, template_type, category, variables, is_active) VALUES
('debt_milestone_25',
'Amazing Progress! You are 25% Debt-Free!',
'<html><body>
<h1>Milestone Achieved!</h1>
<p>Dear {{userName}},</p>
<p><strong>Incredible progress!</strong> You just paid off <strong>{{debtName}}</strong> and reached a major milestone!</p>
<h2>25% DEBT-FREE!</h2>
<p>Just paid off: {{amount}}</p>
<p>Remaining: {{remainingDebt}}</p>
<blockquote>
<p>"Commit to the Lord whatever you do, and he will establish your plans." - Proverbs 16:3</p>
<p>Your commitment to debt freedom is being established. Keep going!</p>
</blockquote>
<p>You are building incredible momentum! Every debt you pay off makes the next one easier.</p>
<p><strong>Legacy Mindset Solutions</strong></p>
</body></html>',
'Amazing Progress! You are 25% Debt-Free!

Dear {{userName}},

Incredible progress! You just paid off {{debtName}} and reached a major milestone!

25% DEBT-FREE!

Just paid off: {{amount}}
Remaining: {{remainingDebt}}

"Commit to the Lord whatever you do, and he will establish your plans." - Proverbs 16:3
Your commitment to debt freedom is being established. Keep going!

You are building incredible momentum! Every debt you pay off makes the next one easier.

Legacy Mindset Solutions',
'milestone',
'debt_freedom',
'["userName", "debtName", "amount", "percentage", "remainingDebt"]',
true);

INSERT INTO email_templates (name, subject, html_content, text_content, template_type, category, variables, is_active) VALUES
('debt_milestone_50',
'Halfway There! 50% Debt-Free Milestone Reached!',
'<html><body>
<h1>Halfway There!</h1>
<p>Dear {{userName}},</p>
<p><strong>YOU ARE HALFWAY TO COMPLETE DEBT FREEDOM!</strong></p>
<p>You just paid off <strong>{{debtName}}</strong> ({{amount}}) and you have now eliminated <strong>HALF</strong> of your total debt!</p>
<h2>50% DEBT-FREE!</h2>
<p>Remaining: {{remainingDebt}}</p>
<blockquote>
<p>"Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up." - Galatians 6:9</p>
<p>You are reaping the harvest of your discipline and perseverance!</p>
</blockquote>
<p>The finish line is in sight! The momentum you have built is incredible.</p>
<p><strong>Legacy Mindset Solutions</strong></p>
</body></html>',
'Halfway There! 50% Debt-Free Milestone Reached!

Dear {{userName}},

YOU ARE HALFWAY TO COMPLETE DEBT FREEDOM!

You just paid off {{debtName}} ({{amount}}) and you have now eliminated HALF of your total debt!

50% DEBT-FREE!
Remaining: {{remainingDebt}}

"Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up." - Galatians 6:9
You are reaping the harvest of your discipline and perseverance!

The finish line is in sight! The momentum you have built is incredible.

Legacy Mindset Solutions',
'milestone',
'debt_freedom',
'["userName", "debtName", "amount", "percentage", "remainingDebt"]',
true);

INSERT INTO email_templates (name, subject, html_content, text_content, template_type, category, variables, is_active) VALUES
('debt_free',
'DEBT-FREE! You Did It - Complete Financial Freedom!',
'<html><body>
<h1>DEBT-FREE!</h1>
<p>Dear {{userName}},</p>
<p><strong>CONGRATULATIONS!</strong> You have achieved what many only dream of - complete freedom from debt!</p>
<h2>100% DEBT-FREE!</h2>
<p>Final debt paid: {{debtName}} - {{amount}}</p>
<p>Total debt eliminated: {{totalDebt}}</p>
<blockquote>
<p>"The rich rule over the poor, and the borrower is slave to the lender." - Proverbs 22:7</p>
<p><strong>YOU ARE NO LONGER A SLAVE TO DEBT!</strong></p>
<p>You have broken every chain of financial bondage. You are FREE!</p>
</blockquote>
<h3>Your Next Chapter: Building Wealth</h3>
<ul>
<li>Emergency Fund: Build 3-6 months of expenses</li>
<li>Retirement Savings: Maximize your contributions</li>
<li>Investments: Start building long-term wealth</li>
<li>Generosity: You can now give more generously</li>
</ul>
<p>You are an inspiration!</p>
<p><strong>Legacy Mindset Solutions</strong></p>
</body></html>',
'DEBT-FREE! You Did It - Complete Financial Freedom!

Dear {{userName}},

CONGRATULATIONS! You have achieved what many only dream of - complete freedom from debt!

100% DEBT-FREE!

Final debt paid: {{debtName}} - {{amount}}
Total debt eliminated: {{totalDebt}}

"The rich rule over the poor, and the borrower is slave to the lender." - Proverbs 22:7
YOU ARE NO LONGER A SLAVE TO DEBT!
You have broken every chain of financial bondage. You are FREE!

Your Next Chapter: Building Wealth:
- Emergency Fund: Build 3-6 months of expenses
- Retirement Savings: Maximize your contributions  
- Investments: Start building long-term wealth
- Generosity: You can now give more generously

You are an inspiration!

Legacy Mindset Solutions',
'milestone',
'debt_freedom',
'["userName", "debtName", "amount", "totalDebt"]',
true);
