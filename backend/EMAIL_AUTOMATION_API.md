# Email Automation API Documentation

## Overview

This comprehensive email automation system provides automated email campaigns triggered by user actions, milestones, and scheduled intervals. The system includes milestone celebrations, engagement emails, behavioral triggers, and scheduled communications.

## Base URL
```
http://localhost:3001/api
```

## Authentication
All email automation routes require admin authentication via JWT Bearer token.

---

## 🎯 Email Automation Triggers

### **1. MILESTONE-BASED EMAILS**

#### Debt Progress Milestones
- **First Debt Paid Off** (`first_debt_paid`)
- **25% Debt Elimination** (`debt_milestone_25`)
- **50% Debt Elimination** (`debt_milestone_50`)
- **75% Debt Elimination** (`debt_milestone_75`)
- **Debt-Free Achievement** (`debt_free`)

#### Framework Progress
- **Framework Step Complete** (`framework_step_complete`)
- **All 6 Steps Complete** (`framework_complete`)

### **2. ENGAGEMENT & RETENTION EMAILS**

#### Activity-Based
- **First Debt Entry** (`first_debt_entry`)
- **Calculator Used** (`calculator_used`)
- **7 Days Inactive** (`user_inactive_7_days`)
- **30 Days Inactive** (`user_inactive_30_days`)

### **3. BEHAVIORAL TRIGGERS**
- **Goal Created** (`goal_created`)
- **PDF Exported** (`pdf_exported`)

### **4. SCHEDULED CAMPAIGNS**
- **Weekly Check-in** (`weekly_check_in`)
- **Monthly Progress Report** (`monthly_report`)

---

## 📧 Email Templates

### Template Variables
All email templates support dynamic variable substitution using `{{variableName}}` syntax:

#### Common Variables
- `{{firstName}}` - User's first name
- `{{lastName}}` - User's last name
- `{{email}}` - User's email address
- `{{platformUrl}}` - Platform base URL
- `{{currentDate}}` - Current date
- `{{currentYear}}` - Current year
- `{{platformName}}` - Platform name

#### Milestone-Specific Variables
- `{{debtName}}` - Name of debt paid off
- `{{amount}}` - Amount paid/eliminated
- `{{percentage}}` - Progress percentage
- `{{totalDebt}}` - Total debt amount
- `{{remainingDebt}}` - Remaining debt balance
- `{{celebrationLevel}}` - Celebration intensity (GOOD, GREAT, FANTASTIC, AMAZING)
- `{{encouragementMessage}}` - Contextual encouragement

#### Framework Variables
- `{{stepNumber}}` - Framework step number (1-6)
- `{{stepTitle}}` - Framework step title
- `{{nextStepNumber}}` - Next step number
- `{{nextStepTitle}}` - Next step title
- `{{progressPercentage}}` - Framework completion percentage

#### Activity Variables
- `{{debtCount}}` - Number of debts entered
- `{{strategy}}` - Debt elimination strategy
- `{{monthsToPayoff}}` - Time to debt freedom
- `{{totalInterest}}` - Interest savings
- `{{extraPayment}}` - Extra payment amount
- `{{daysSinceLastLogin}}` - Days since last activity
- `{{weeklyTip}}` - Weekly financial tip
- `{{biblicalVerse}}` - Weekly biblical verse

---

## 🔄 Automatic Triggers

### Debt Management Triggers

#### First Debt Entry
```javascript
// Triggered automatically when user creates their first debt
POST /api/pour-payoff/debts
// Triggers: first_debt_entry email
```

#### Calculator Usage
```javascript
// Triggered when user calculates payoff scenarios
POST /api/pour-payoff/debts/calculate-payoff
// Triggers: calculator_used email (delayed 1 day)
```

#### Framework Step Completion
```javascript
// Triggered when user completes a framework step
PUT /api/pour-payoff/framework/steps/:stepId/progress
// Triggers: framework_step_complete email
```

### User Activity Tracking

The system automatically tracks user activities and triggers appropriate emails:

```javascript
// Activities tracked:
- debt_entry
- calculator_used
- framework_step_complete
- goal_created
- pdf_exported
- debt_paid_off
```

---

## 📅 Scheduled Email Campaigns

### Cron Schedule

#### Daily Inactivity Check
```
Schedule: 0 10 * * * (Daily at 10 AM)
Purpose: Check for inactive users and send re-engagement emails
```

#### Weekly Check-ins
```
Schedule: 0 9 * * 1 (Mondays at 9 AM)
Purpose: Send weekly progress check-ins and motivation
```

#### Monthly Reports
```
Schedule: 0 10 1 * * (1st of month at 10 AM)
Purpose: Send monthly progress reports and insights
```

---

## 🎛️ Admin API Endpoints

### Scheduled Email Management

#### Get Scheduled Job Status
```http
GET /api/scheduled-emails/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "name": "inactivity-check",
        "running": true,
        "scheduled": true
      },
      {
        "name": "weekly-checkins", 
        "running": true,
        "scheduled": true
      },
      {
        "name": "monthly-reports",
        "running": true,
        "scheduled": true
      }
    ],
    "timestamp": "2024-01-15T10:00:00.000Z"
  }
}
```

#### Manually Trigger Inactivity Check
```http
POST /api/scheduled-emails/trigger/inactivity-check
```

#### Manually Trigger Weekly Check-ins
```http
POST /api/scheduled-emails/trigger/weekly-checkins
```

#### Manually Trigger Monthly Reports
```http
POST /api/scheduled-emails/trigger/monthly-reports
```

### Email Templates Management

#### Get All Templates
```http
GET /api/email-automation/templates
```

#### Create Template
```http
POST /api/email-automation/templates

{
  "name": "Debt Milestone 50%",
  "subject": "🎉 Halfway to Freedom, {{firstName}}!",
  "html_content": "<html>...</html>",
  "text_content": "Plain text version...",
  "template_type": "milestone",
  "category": "debt_freedom",
  "variables": ["firstName", "percentage", "amount", "encouragementMessage"],
  "is_active": true
}
```

### Campaign Management

#### Get All Campaigns
```http
GET /api/email-automation/campaigns
```

#### Create Campaign
```http
POST /api/email-automation/campaigns

{
  "name": "50% Debt Milestone Celebration",
  "description": "Celebrate user reaching 50% debt elimination",
  "template_id": 5,
  "campaign_type": "milestone",
  "trigger_event": "debt_milestone_50",
  "delay_days": 0,
  "send_time": "10:00:00",
  "target_criteria": {},
  "is_active": true
}
```

#### Send Test Email
```http
POST /api/email-automation/campaigns/:id/test

{
  "testEmail": "test@example.com"
}
```

---

## 📊 Analytics & Tracking

### Email Performance Metrics

#### Get Analytics
```http
GET /api/email-automation/analytics?campaignId=1&dateRange=30
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSends": 150,
    "sentCount": 145,
    "deliveredCount": 140,
    "openedCount": 89,
    "clickedCount": 23,
    "bouncedCount": 5,
    "openRate": 63.6,
    "clickRate": 16.4,
    "bounceRate": 3.4,
    "avgOpens": 1.2,
    "avgClicks": 0.3
  }
}
```

### Email Open Tracking

Emails automatically include invisible tracking pixels:

```http
GET /api/tracking/open/:trackingId
```

This endpoint:
- Records email open events
- Updates open counts and timestamps
- Returns 1x1 transparent GIF
- Tracks IP address and user agent

---

## 🎨 Email Template Examples

### Milestone Email (First Debt Paid)
```html
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>First Debt Paid!</title></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #4CAF50, #45a049); color: white; padding: 30px; text-align: center;">
    <h1>🎉 CONGRATULATIONS {{firstName}}! 🎉</h1>
    <h2>You Paid Off {{debtName}}!</h2>
  </div>
  
  <div style="padding: 25px; background: #f9f9f9; margin: 25px 0;">
    <h3>Your First Victory is Complete! 🏆</h3>
    <p><strong>Debt Eliminated:</strong> {{amount}}</p>
    <p><strong>Remaining Debt:</strong> {{remainingDebt}}</p>
    <p style="font-style: italic;">{{encouragementMessage}}</p>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{platformUrl}}/calculator" style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">Continue Your Journey →</a>
  </div>
</body>
</html>
```

### Weekly Check-in Email
```html
<div style="background: linear-gradient(135deg, #2196F3, #1976D2); color: white; padding: 30px; text-align: center;">
  <h1>📊 Weekly Check-in 📊</h1>
  <h2>How's Your Progress, {{firstName}}?</h2>
</div>

<div style="padding: 25px;">
  <h3>This Week's Progress 📈</h3>
  <p><strong>Weekly Update:</strong> {{weeklyProgress}}</p>
  <p><strong>Overall Progress:</strong> {{totalProgress}}</p>
  
  <h4>💡 This Week's Tip:</h4>
  <p>{{weeklyTip}}</p>
  
  <h4>📖 Weekly Verse:</h4>
  <p style="font-style: italic;">{{biblicalVerse}}</p>
</div>
```

---

## 🔧 User Preferences

### Email Preferences Management

Users can control which emails they receive:

```javascript
// Email preference types:
- welcome_emails: true/false
- milestone_emails: true/false  
- framework_emails: true/false
- engagement_emails: true/false
- educational_emails: true/false
- marketing_emails: true/false
- weekly_checkins: true/false
- monthly_reports: true/false

// Frequency preferences:
- frequency_preference: 'minimal' | 'normal' | 'frequent'
```

---

## 🚀 Implementation Status

### ✅ Completed Features

1. **Email Service Infrastructure**
   - EmailAutomationService with all trigger methods
   - UserActivityService for tracking and automation
   - ScheduledEmailService for cron jobs
   - Comprehensive email templates

2. **Milestone Emails**
   - First debt paid celebration
   - 25%, 50%, 75% debt elimination milestones
   - Debt-free achievement
   - Framework step completions

3. **Engagement Emails** 
   - First debt entry welcome
   - Calculator usage follow-up
   - 7-day and 30-day inactivity re-engagement

4. **Scheduled Campaigns**
   - Weekly check-ins (Mondays 9 AM)
   - Monthly progress reports (1st of month 10 AM)
   - Daily inactivity checks (Daily 10 AM)

5. **Backend Integration**
   - Automatic triggers in debt management routes
   - Framework step completion triggers
   - User activity tracking
   - Admin API endpoints

6. **Email Tracking**
   - Open tracking with invisible pixels
   - Analytics and performance metrics
   - Send history and user engagement data

### 🎯 Ready for Frontend Integration

The backend email automation system is complete and ready for frontend integration. Frontend components can now:

1. Display email preferences in user settings
2. Show email analytics in admin dashboard
3. Trigger manual email campaigns
4. View scheduled job status
5. Manage email templates and campaigns

---

## 📝 Testing

### Manual Testing Endpoints

```bash
# Test inactivity check
curl -X POST http://localhost:3001/api/scheduled-emails/trigger/inactivity-check \
  -H "Authorization: Bearer YOUR_ADMIN_JWT"

# Test weekly check-ins  
curl -X POST http://localhost:3001/api/scheduled-emails/trigger/weekly-checkins \
  -H "Authorization: Bearer YOUR_ADMIN_JWT"

# Test monthly reports
curl -X POST http://localhost:3001/api/scheduled-emails/trigger/monthly-reports \
  -H "Authorization: Bearer YOUR_ADMIN_JWT"
```

### Test Email Triggers

```bash
# Create first debt (triggers first_debt_entry email)
curl -X POST http://localhost:3001/api/pour-payoff/debts \
  -H "Authorization: Bearer USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{"name":"Credit Card","balance":5000,"interestRate":0.1899,"minimumPayment":150,"dueDate":15}'

# Calculate payoff (triggers calculator_used email)
curl -X POST http://localhost:3001/api/pour-payoff/debts/calculate-payoff \
  -H "Authorization: Bearer USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{"extraPayment":200}'
```

---

## 🎉 Complete Email Automation System

This comprehensive email automation system provides:

- **13 different email triggers** covering all user journey stages
- **Professional HTML email templates** with biblical encouragement
- **Automated milestone celebrations** for debt progress
- **Smart re-engagement campaigns** for inactive users
- **Scheduled weekly and monthly communications**
- **Complete analytics and tracking** with open/click metrics
- **Admin management interface** for templates and campaigns
- **User preference controls** for email frequency and types

The system is production-ready and will significantly enhance user engagement and retention on your debt freedom platform! 🚀
