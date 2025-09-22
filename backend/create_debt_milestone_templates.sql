-- Create email templates for debt milestone celebrations
-- These templates are triggered when users mark debts as paid off

-- First Debt Paid Off Template
INSERT INTO email_templates (name, subject, html_content, text_content, variables, is_active, created_at) VALUES
('first_debt_paid', 
'🎉 Congratulations! You Just Paid Off Your First Debt!',
'<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>First Debt Paid Off - Celebration!</title>
    <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f8f9fa; }
        .celebration { font-size: 48px; text-align: center; margin: 20px 0; }
        .amount { font-size: 24px; color: #28a745; font-weight: bold; text-align: center; margin: 15px 0; }
        .progress { background: #e9ecef; border-radius: 10px; overflow: hidden; margin: 20px 0; }
        .progress-bar { background: #28a745; height: 20px; border-radius: 10px; }
        .biblical-quote { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; font-style: italic; }
        .next-steps { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .footer { text-align: center; color: #6c757d; padding: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 CONGRATULATIONS! 🎉</h1>
            <h2>You Just Paid Off Your First Debt!</h2>
        </div>
        
        <div class="content">
            <div class="celebration">🎊✨🏆✨🎊</div>
            
            <p>Dear {{userName}},</p>
            
            <p><strong>This is HUGE!</strong> You just paid off <strong>{{debtName}}</strong> - your first step toward complete financial freedom!</p>
            
            <div class="amount">
                💰 {{amount}} PAID OFF! 💰
            </div>
            
            <div class="biblical-quote">
                <p><strong>"The rich rule over the poor, and the borrower is slave to the lender."</strong></p>
                <p style="text-align: right;">- Proverbs 22:7</p>
                <p>You just broke one chain of financial bondage. You are no longer a slave to <strong>{{debtName}}</strong>!</p>
            </div>
            
            <div class="next-steps">
                <h3>🚀 Keep the Momentum Going!</h3>
                <ul>
                    <li><strong>Celebrate this victory</strong> - You deserve it!</li>
                    <li><strong>Apply the same payment</strong> to your next debt (debt snowball method)</li>
                    <li><strong>Stay focused</strong> on your debt freedom journey</li>
                    <li><strong>Remember why you started</strong> - financial peace and freedom</li>
                </ul>
            </div>
            
            <p>Your total debt remaining: <strong>{{remainingDebt}}</strong></p>
            <p>You are <strong>{{percentage}}%</strong> closer to being completely debt-free!</p>
            
            <div class="biblical-quote">
                <p><strong>"She is clothed with strength and dignity; she can laugh at the days to come."</strong></p>
                <p style="text-align: right;">- Proverbs 31:25</p>
                <p>This is your future - clothed with financial strength and dignity!</p>
            </div>
        </div>
        
        <div class="footer">
            <p>Celebrating your victory with you! 🎉</p>
            <p><strong>Legacy Mindset Solutions</strong><br>
            Harmony in Finance, Harmony in Life</p>
        </div>
    </div>
</body>
</html>',
'🎉 CONGRATULATIONS! 🎉
You Just Paid Off Your First Debt!

Dear {{userName}},

This is HUGE! You just paid off {{debtName}} - your first step toward complete financial freedom!

💰 {{amount}} PAID OFF! 💰

"The rich rule over the poor, and the borrower is slave to lender." - Proverbs 22:7

You just broke one chain of financial bondage. You are no longer a slave to {{debtName}}!

🚀 Keep the Momentum Going!
- Celebrate this victory - You deserve it!
- Apply the same payment to your next debt (debt snowball method)
- Stay focused on your debt freedom journey
- Remember why you started - financial peace and freedom

Your total debt remaining: {{remainingDebt}}
You are {{percentage}}% closer to being completely debt-free!

"She is clothed with strength and dignity; she can laugh at the days to come." - Proverbs 31:25

This is your future - clothed with financial strength and dignity!

Celebrating your victory with you! 🎉

Legacy Mindset Solutions
Harmony in Finance, Harmony in Life',
'["userName", "debtName", "amount", "percentage", "remainingDebt"]',
true,
CURRENT_TIMESTAMP);

-- 25% Debt Milestone Template
INSERT INTO email_templates (name, subject, html_content, text_content, variables, is_active, created_at) VALUES
('debt_milestone_25',
'🎯 Amazing Progress! You''re 25% Debt-Free!',
'<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>25% Debt-Free Milestone!</title>
    <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: linear-gradient(135deg, #17a2b8, #28a745); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f8f9fa; }
        .milestone { font-size: 48px; text-align: center; margin: 20px 0; }
        .progress { background: #e9ecef; border-radius: 10px; overflow: hidden; margin: 20px 0; height: 30px; }
        .progress-bar { background: #28a745; height: 30px; width: 25%; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; }
        .stat { text-align: center; }
        .stat-number { font-size: 24px; color: #28a745; font-weight: bold; }
        .biblical-quote { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; font-style: italic; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 MILESTONE ACHIEVED! 🎯</h1>
            <h2>You''re 25% Debt-Free!</h2>
        </div>
        
        <div class="content">
            <div class="milestone">🌟 25% 🌟</div>
            
            <p>Dear {{userName}},</p>
            
            <p><strong>Incredible progress!</strong> You just paid off <strong>{{debtName}}</strong> and reached a major milestone!</p>
            
            <div class="progress">
                <div class="progress-bar">25% Complete!</div>
            </div>
            
            <div class="stats">
                <div class="stat">
                    <div class="stat-number">{{amount}}</div>
                    <div>Just Paid Off</div>
                </div>
                <div class="stat">
                    <div class="stat-number">{{remainingDebt}}</div>
                    <div>Remaining</div>
                </div>
            </div>
            
            <div class="biblical-quote">
                <p><strong>"Commit to the Lord whatever you do, and he will establish your plans."</strong></p>
                <p style="text-align: right;">- Proverbs 16:3</p>
                <p>Your commitment to debt freedom is being established. Keep going!</p>
            </div>
            
            <p><strong>You''re building incredible momentum!</strong> Every debt you pay off makes the next one easier. The debt snowball is working!</p>
        </div>
        
        <div class="footer">
            <p>Keep up the amazing work! 🚀</p>
            <p><strong>Legacy Mindset Solutions</strong></p>
        </div>
    </div>
</body>
</html>',
'🎯 MILESTONE ACHIEVED! 🎯
You''re 25% Debt-Free!

Dear {{userName}},

Incredible progress! You just paid off {{debtName}} and reached a major milestone!

🌟 25% COMPLETE! 🌟

Progress: [████████░░░░░░░░░░░░░░░░░░░░░░░░] 25%

Just Paid Off: {{amount}}
Remaining: {{remainingDebt}}

"Commit to the Lord whatever you do, and he will establish your plans." - Proverbs 16:3

Your commitment to debt freedom is being established. Keep going!

You''re building incredible momentum! Every debt you pay off makes the next one easier. The debt snowball is working!

Keep up the amazing work! 🚀

Legacy Mindset Solutions',
'["userName", "debtName", "amount", "percentage", "remainingDebt"]',
true,
CURRENT_TIMESTAMP);

-- 50% Debt Milestone Template  
INSERT INTO email_templates (name, subject, html_content, text_content, variables, is_active, created_at) VALUES
('debt_milestone_50',
'🚀 Halfway There! 50% Debt-Free Milestone Reached!',
'<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>50% Debt-Free - Halfway There!</title>
    <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: linear-gradient(135deg, #fd7e14, #28a745); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f8f9fa; }
        .milestone { font-size: 48px; text-align: center; margin: 20px 0; }
        .progress { background: #e9ecef; border-radius: 10px; overflow: hidden; margin: 20px 0; height: 30px; }
        .progress-bar { background: #fd7e14; height: 30px; width: 50%; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
        .celebration { text-align: center; font-size: 20px; margin: 20px 0; }
        .biblical-quote { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; font-style: italic; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 HALFWAY THERE! 🚀</h1>
            <h2>50% Debt-Free Milestone!</h2>
        </div>
        
        <div class="content">
            <div class="milestone">🎯 50% 🎯</div>
            
            <p>Dear {{userName}},</p>
            
            <div class="celebration">
                🎉 YOU''RE HALFWAY TO COMPLETE DEBT FREEDOM! 🎉
            </div>
            
            <p>You just paid off <strong>{{debtName}}</strong> ({{amount}}) and you''ve now eliminated <strong>HALF</strong> of your total debt!</p>
            
            <div class="progress">
                <div class="progress-bar">50% Complete!</div>
            </div>
            
            <div class="biblical-quote">
                <p><strong>"Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up."</strong></p>
                <p style="text-align: right;">- Galatians 6:9</p>
                <p>You''re reaping the harvest of your discipline and perseverance!</p>
            </div>
            
            <p><strong>The finish line is in sight!</strong> With {{remainingDebt}} left to go, you''re closer than ever to complete financial freedom.</p>
            
            <p>The momentum you''ve built is incredible. Each remaining debt will fall faster than the last!</p>
        </div>
        
        <div class="footer">
            <p>You''re doing amazing! Keep pushing forward! 💪</p>
            <p><strong>Legacy Mindset Solutions</strong></p>
        </div>
    </div>
</body>
</html>',
'🚀 HALFWAY THERE! 🚀
50% Debt-Free Milestone!

Dear {{userName}},

🎉 YOU''RE HALFWAY TO COMPLETE DEBT FREEDOM! 🎉

You just paid off {{debtName}} ({{amount}}) and you''ve now eliminated HALF of your total debt!

Progress: [████████████████░░░░░░░░░░░░░░░░] 50%

"Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up." - Galatians 6:9

You''re reaping the harvest of your discipline and perseverance!

The finish line is in sight! With {{remainingDebt}} left to go, you''re closer than ever to complete financial freedom.

The momentum you''ve built is incredible. Each remaining debt will fall faster than the last!

You''re doing amazing! Keep pushing forward! 💪

Legacy Mindset Solutions',
'["userName", "debtName", "amount", "percentage", "remainingDebt"]',
true,
CURRENT_TIMESTAMP);

-- Complete Debt Freedom Template
INSERT INTO email_templates (name, subject, html_content, text_content, variables, is_active, created_at) VALUES
('debt_free',
'🎊 DEBT-FREE! You Did It - Complete Financial Freedom!',
'<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>DEBT-FREE! Complete Financial Freedom!</title>
    <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: linear-gradient(135deg, #dc3545, #ffc107, #28a745); color: white; padding: 40px; text-align: center; }
        .content { padding: 30px; background: #f8f9fa; }
        .celebration { font-size: 60px; text-align: center; margin: 30px 0; }
        .achievement { background: white; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        .biblical-quote { background: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; font-style: italic; }
        .next-chapter { background: #fff3cd; border-radius: 8px; padding: 20px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎊 DEBT-FREE! 🎊</h1>
            <h2>YOU DID IT!</h2>
            <h3>Complete Financial Freedom Achieved!</h3>
        </div>
        
        <div class="content">
            <div class="celebration">🏆🎉✨🎊✨🎉🏆</div>
            
            <p>Dear {{userName}},</p>
            
            <div class="achievement">
                <h2>🎯 100% DEBT-FREE! 🎯</h2>
                <p><strong>Final Debt Paid:</strong> {{debtName}} - {{amount}}</p>
                <p><strong>Total Debt Eliminated:</strong> {{totalDebt}}</p>
            </div>
            
            <p><strong>CONGRATULATIONS!</strong> You have achieved what many only dream of - complete freedom from debt!</p>
            
            <div class="biblical-quote">
                <p><strong>"The rich rule over the poor, and the borrower is slave to the lender."</strong></p>
                <p style="text-align: right;">- Proverbs 22:7</p>
                <p><strong>YOU ARE NO LONGER A SLAVE TO DEBT!</strong></p>
                <p>You have broken every chain of financial bondage. You are FREE!</p>
            </div>
            
            <div class="next-chapter">
                <h3>🚀 Your Next Chapter: Building Wealth</h3>
                <ul>
                    <li><strong>Emergency Fund:</strong> Build 3-6 months of expenses</li>
                    <li><strong>Retirement Savings:</strong> Maximize your 401k and IRA contributions</li>
                    <li><strong>Investments:</strong> Start building long-term wealth</li>
                    <li><strong>Generosity:</strong> You can now give more generously than ever</li>
                </ul>
            </div>
            
            <div class="biblical-quote">
                <p><strong>"She is clothed with strength and dignity; she can laugh at the days to come."</strong></p>
                <p style="text-align: right;">- Proverbs 31:25</p>
                <p>This is you now - clothed with financial strength and dignity!</p>
            </div>
            
            <p><strong>You are an inspiration!</strong> Your journey from debt to freedom will encourage countless others to follow in your footsteps.</p>
        </div>
        
        <div class="footer">
            <p>We are SO proud of you! 🎉</p>
            <p><strong>Legacy Mindset Solutions</strong><br>
            Harmony in Finance, Harmony in Life</p>
        </div>
    </div>
</body>
</html>',
'🎊 DEBT-FREE! 🎊
YOU DID IT!
Complete Financial Freedom Achieved!

Dear {{userName}},

🏆🎉✨🎊✨🎉🏆

🎯 100% DEBT-FREE! 🎯

Final Debt Paid: {{debtName}} - {{amount}}
Total Debt Eliminated: {{totalDebt}}

CONGRATULATIONS! You have achieved what many only dream of - complete freedom from debt!

"The rich rule over the poor, and the borrower is slave to the lender." - Proverbs 22:7

YOU ARE NO LONGER A SLAVE TO DEBT!

You have broken every chain of financial bondage. You are FREE!

🚀 Your Next Chapter: Building Wealth
- Emergency Fund: Build 3-6 months of expenses  
- Retirement Savings: Maximize your 401k and IRA contributions
- Investments: Start building long-term wealth
- Generosity: You can now give more generously than ever

"She is clothed with strength and dignity; she can laugh at the days to come." - Proverbs 31:25

This is you now - clothed with financial strength and dignity!

You are an inspiration! Your journey from debt to freedom will encourage countless others to follow in your footsteps.

We are SO proud of you! 🎉

Legacy Mindset Solutions
Harmony in Finance, Harmony in Life',
'["userName", "debtName", "amount", "totalDebt"]',
true,
CURRENT_TIMESTAMP);
