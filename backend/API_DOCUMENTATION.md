# The Pour & Payoff Planner™ API Documentation

## Overview

This API provides comprehensive functionality for "The Pour & Payoff Planner™" - a debt freedom application based on the Widow's Wealth Cycle™ framework from 2 Kings 4.

## Base URL
```
http://localhost:3001/api
```

## Authentication

All protected routes require authentication. Include the user ID in the request (this will be replaced with proper JWT authentication in production).

## API Endpoints

### Authentication Routes

#### User Registration
```http
POST /api/auth/signup
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

#### User Login
```http
POST /api/auth/signin
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Google OAuth
```http
GET /api/auth/google/url
GET /api/auth/google/callback
POST /api/auth/google/verify
```

### Debt Management Routes

#### Get All Debts
```http
GET /api/pour-payoff/debts
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "name": "Credit Card",
      "balance": 5000.00,
      "interestRate": 0.1899,
      "minimumPayment": 150.00,
      "dueDate": 15,
      "debtType": "credit_card",
      "priority": 1,
      "isActive": true,
      "paidOffDate": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Create New Debt
```http
POST /api/pour-payoff/debts
```

**Request Body:**
```json
{
  "name": "Credit Card",
  "balance": 5000.00,
  "interestRate": 0.1899,
  "minimumPayment": 150.00,
  "dueDate": 15,
  "debtType": "credit_card",
  "priority": 1
}
```

#### Update Debt
```http
PUT /api/pour-payoff/debts/:id
```

#### Delete Debt
```http
DELETE /api/pour-payoff/debts/:id
```

#### Get Debt Statistics
```http
GET /api/pour-payoff/debts/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_debts": 3,
    "active_debts": 2,
    "paid_off_debts": 1,
    "total_balance": 15000.00,
    "total_minimum_payments": 450.00,
    "average_interest_rate": 0.1650
  }
}
```

#### Calculate Payoff Scenarios
```http
POST /api/pour-payoff/debts/calculate-payoff
```

**Request Body:**
```json
{
  "extraPayment": 200.00
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "snowball": [
      {
        "debtId": 1,
        "name": "Credit Card",
        "balance": 5000.00,
        "interestRate": 0.1899,
        "minimumPayment": 150.00,
        "payoffMonths": 24,
        "totalInterest": 850.00,
        "payoffDate": "2025-12-01T00:00:00.000Z"
      }
    ],
    "avalanche": [...],
    "summary": {
      "snowball": {
        "totalMonths": 24,
        "totalInterest": 1850.00
      },
      "avalanche": {
        "totalMonths": 22,
        "totalInterest": 1750.00
      }
    }
  }
}
```

### Framework Steps Routes

#### Get All Framework Steps
```http
GET /api/pour-payoff/framework/steps
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "stepNumber": 1,
      "title": "INVENTORY",
      "subtitle": "What's In Your House?",
      "description": "Identify your current income, assets, skills, and untapped potential",
      "biblicalReference": "2 Kings 4:2",
      "iconName": "inventory",
      "instructions": "Take a complete inventory of all your resources...",
      "worksheetQuestions": [
        "What are your current income sources?",
        "What assets do you own?",
        "What skills or talents could generate income?",
        "What resources are you overlooking?"
      ],
      "successCriteria": {
        "debt_listed": true,
        "income_sources_identified": true,
        "assets_catalogued": true
      }
    }
  ]
}
```

#### Get User's Framework Progress
```http
GET /api/pour-payoff/framework/progress
```

#### Update Framework Step Progress
```http
PUT /api/pour-payoff/framework/steps/:stepId/progress
```

**Request Body:**
```json
{
  "isCompleted": true,
  "progressPercentage": 100,
  "worksheetResponses": {
    "income_sources": ["Salary", "Side hustle"],
    "assets": ["Car", "Savings account"],
    "skills": ["Writing", "Design"]
  },
  "notes": "Completed inventory successfully"
}
```

#### Get Current Framework Step
```http
GET /api/pour-payoff/framework/current-step
```

#### Get Framework Statistics
```http
GET /api/pour-payoff/framework/stats
```

### Devotionals Routes

#### Get All Devotionals
```http
GET /api/pour-payoff/devotionals
```

**Query Parameters:**
- `limit` (optional): Number of devotionals to return (default: 50)
- `offset` (optional): Number of devotionals to skip (default: 0)
- `category` (optional): Filter by category

#### Get Today's Devotional
```http
GET /api/pour-payoff/devotionals/today
```

#### Get Specific Devotional
```http
GET /api/pour-payoff/devotionals/:id
```

#### Get User's Devotional Progress
```http
GET /api/pour-payoff/devotionals/progress
```

#### Mark Devotional as Read
```http
POST /api/pour-payoff/devotionals/:id/read
```

**Request Body:**
```json
{
  "readingTimeSeconds": 180,
  "rating": 5,
  "notes": "Great devotional about stewardship"
}
```

#### Toggle Favorite Status
```http
POST /api/pour-payoff/devotionals/:id/favorite
```

#### Get User's Favorite Devotionals
```http
GET /api/pour-payoff/devotionals/favorites
```

#### Get Devotional Reading Statistics
```http
GET /api/pour-payoff/devotionals/stats
```

#### Get Available Categories
```http
GET /api/pour-payoff/devotionals/categories
```

### Calendar Routes

#### Get Calendar Events by Date Range
```http
GET /api/pour-payoff/calendar/events?startDate=2024-01-01&endDate=2024-01-31
```

#### Get Events for Specific Date
```http
GET /api/pour-payoff/calendar/events/date/2024-01-15
```

#### Create Calendar Event
```http
POST /api/pour-payoff/calendar/events
```

**Request Body:**
```json
{
  "title": "Payment Due: Credit Card",
  "description": "Minimum payment of $150 is due",
  "eventDate": "2024-01-15",
  "eventTime": "09:00:00",
  "eventType": "payment_due",
  "relatedDebtId": 1
}
```

#### Update Calendar Event
```http
PUT /api/pour-payoff/calendar/events/:id
```

#### Mark Event as Completed
```http
POST /api/pour-payoff/calendar/events/:id/complete
```

#### Delete Calendar Event
```http
DELETE /api/pour-payoff/calendar/events/:id
```

#### Get Upcoming Events
```http
GET /api/pour-payoff/calendar/events/upcoming?days=30
```

#### Get Overdue Events
```http
GET /api/pour-payoff/calendar/events/overdue
```

#### Generate Payment Reminders
```http
POST /api/pour-payoff/calendar/generate-reminders
```

### Scenarios Routes

#### Get All Scenarios
```http
GET /api/pour-payoff/scenarios
```

#### Create New Scenario
```http
POST /api/pour-payoff/scenarios
```

**Request Body:**
```json
{
  "name": "Bonus Payment Scenario",
  "description": "What if I get a $2000 bonus?",
  "scenarioType": "bonus",
  "parameters": {
    "bonusAmount": 2000,
    "spreadOverMonths": 12
  },
  "monthsSaved": 6,
  "interestSaved": 450.00,
  "newPayoffDate": "2024-06-15"
}
```

#### Update Scenario
```http
PUT /api/pour-payoff/scenarios/:id
```

#### Delete Scenario
```http
DELETE /api/pour-payoff/scenarios/:id
```

#### Get Scenarios by Type
```http
GET /api/pour-payoff/scenarios/type/bonus
```

### Achievements Routes

#### Get All Achievements
```http
GET /api/pour-payoff/achievements
```

#### Get User's Achievements
```http
GET /api/pour-payoff/achievements/user
```

#### Get Earned Achievements
```http
GET /api/pour-payoff/achievements/earned
```

#### Get Achievement Statistics
```http
GET /api/pour-payoff/achievements/stats
```

#### Get Recent Achievements
```http
GET /api/pour-payoff/achievements/recent?days=30
```

### Dashboard Routes

#### Get Dashboard Data
```http
GET /api/pour-payoff/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "debtStats": {
      "total_debts": 3,
      "active_debts": 2,
      "total_balance": 15000.00,
      "total_minimum_payments": 450.00
    },
    "frameworkStats": {
      "total_steps": 6,
      "completed_steps": 2,
      "completion_percentage": 33.33
    },
    "devotionalStats": {
      "total_devotionals": 50,
      "read_devotionals": 15,
      "average_rating": 4.2
    },
    "currentStep": {
      "id": 3,
      "stepNumber": 3,
      "title": "IMPLEMENTATION",
      "subtitle": "Shut the Door and Pour"
    },
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  }
}
```

### User Settings Routes

#### Get User Settings
```http
GET /api/pour-payoff/settings
```

#### Update User Settings
```http
PUT /api/pour-payoff/settings
```

**Request Body:**
```json
{
  "themePreference": "dark",
  "onboardingCompleted": true,
  "currentFrameworkStep": 3
}
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Data Models

### Debt
```json
{
  "id": 1,
  "userId": 1,
  "name": "Credit Card",
  "balance": 5000.00,
  "interestRate": 0.1899,
  "minimumPayment": 150.00,
  "dueDate": 15,
  "debtType": "credit_card",
  "priority": 1,
  "isActive": true,
  "paidOffDate": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Framework Step
```json
{
  "id": 1,
  "stepNumber": 1,
  "title": "INVENTORY",
  "subtitle": "What's In Your House?",
  "description": "Identify your current income, assets, skills, and untapped potential",
  "biblicalReference": "2 Kings 4:2",
  "iconName": "inventory",
  "instructions": "Take a complete inventory...",
  "worksheetQuestions": ["Question 1", "Question 2"],
  "successCriteria": {"key": "value"}
}
```

### Devotional
```json
{
  "id": 1,
  "title": "The Widow's Faith",
  "content": "In 2 Kings 4, we see a widow facing impossible circumstances...",
  "biblicalReference": "2 Kings 4:1-7",
  "verseText": "The widow said to Elisha...",
  "category": "debt_freedom",
  "readingTimeMinutes": 3,
  "difficultyLevel": "beginner",
  "isPublished": true,
  "publishDate": "2024-01-01"
}
```

## Rate Limiting

- 100 requests per 15 minutes per IP address
- Rate limit headers included in responses

## CORS

- Origin: `http://localhost:8080` (configurable)
- Credentials: enabled
- Methods: GET, POST, PUT, DELETE, OPTIONS

## Security Features

- Helmet.js security headers
- Input validation and sanitization
- SQL injection protection with parameterized queries
- Rate limiting
- CORS protection

