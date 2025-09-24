const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('dotenv').config({ path: './config.env' });

const { initializeDatabase } = require('./config/database');
const scheduledEmailService = require('./services/scheduledEmailService');
const debtBalanceMonitor = require('./services/debtBalanceMonitor');
const leadEmailScheduler = require('./services/leadEmailScheduler');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/authRoutes');
const googleAuthRoutes = require('./routes/googleAuthRoutes');
const pourPayoffRoutes = require('./routes/pourPayoffRoutes');
const enhancedDebtRoutes = require('./routes/enhancedDebtRoutes');
const debtPaymentRoutes = require('./routes/debtPaymentRoutes');
const adminDebtRoutes = require('./routes/adminDebtRoutes');
const emailAutomationRoutes = require('./routes/emailAutomationRoutes');
const trackingRoutes = require('./routes/trackingRoutes');
const scheduledEmailRoutes = require('./routes/scheduledEmailRoutes');
const leadRoutes = require('./routes/leadRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting - Increased limits for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased from 100 to 1000 requests per windowMs for development
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/google', googleAuthRoutes);
app.use('/api/pour-payoff', pourPayoffRoutes);
app.use('/api/debts', enhancedDebtRoutes);
app.use('/api/debt-payments', debtPaymentRoutes);
app.use('/api/admin/debts', adminDebtRoutes);
app.use('/api/email-automation', emailAutomationRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/scheduled-emails', scheduledEmailRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/user', userRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Start server
const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase();
    console.log('✅ Database tables initialized successfully');
    
    // Initialize and start scheduled email services
    scheduledEmailService.init();
    scheduledEmailService.start();
    console.log('✅ Scheduled email services started');
    
    // Initialize and start debt balance monitor
    if (process.env.DEBT_MONITOR_ENABLED === 'true') {
      debtBalanceMonitor.start();
      console.log('✅ Debt balance monitor started');
    }
    
    // Initialize and start lead email scheduler
    leadEmailScheduler.start();
    console.log('✅ Lead email scheduler started');
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`💾 Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
      console.log(`📧 Email automation: Active`);
      
      // Log scheduled job status
      const jobStatus = scheduledEmailService.getStatus();
      jobStatus.forEach(job => {
        console.log(`  📅 ${job.name}: ${job.running ? 'Running' : 'Stopped'}`);
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();