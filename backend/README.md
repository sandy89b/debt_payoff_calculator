# Debt Freedom Builder Bible - Backend API

This is the backend API for the Debt Freedom Builder Bible application, built with Node.js, Express, and PostgreSQL.

## Features

- User authentication (signup/signin)
- PostgreSQL database integration
- Password hashing with bcrypt
- Input validation with Joi
- Rate limiting and security middleware
- CORS configuration
- Environment-based configuration

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `config.env` and update the database credentials
   - Make sure your PostgreSQL server is running

4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Configuration

Create a `config.env` file with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_password

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration (for future use)
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:8080
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/signin` - Sign in user
- `GET /api/auth/profile` - Get current user profile (requires authentication)

### Health Check

- `GET /health` - Server health check

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Usage Examples

### Signup

```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123"
  }'
```

### Signin

```bash
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

## Security Features

- Password hashing with bcrypt (12 salt rounds)
- Rate limiting (100 requests per 15 minutes per IP)
- CORS protection
- Helmet.js security headers
- Input validation and sanitization
- SQL injection protection with parameterized queries

## Development

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests (when implemented)

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong JWT secret
3. Configure proper CORS origins
4. Set up SSL/HTTPS
5. Use environment variables for sensitive data
6. Set up proper logging and monitoring
