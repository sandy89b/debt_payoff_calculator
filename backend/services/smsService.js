const twilio = require('twilio');
const logger = require('../utils/logger');

class SMSService {
  constructor() {
    // Initialize Twilio client if credentials are provided
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
      this.isEnabled = true;
      logger.info('SMS Service initialized with Twilio');
    } else {
      this.isEnabled = false;
      logger.info('SMS Service disabled - Twilio credentials not provided');
    }
  }

  // Send SMS message
  async sendSMS(to, message, options = {}) {
    try {
      // Validate phone number format
      if (!this.isValidPhoneNumber(to)) {
        throw new Error(`Invalid phone number format: ${to}`);
      }

      // If Twilio is not enabled, log the message instead
      if (!this.isEnabled) {
        logger.devInfo(`SMS would be sent to ${to}: ${message}`);
        return { 
          success: true, 
          messageId: 'dev-mode',
          status: 'development',
          to,
          message 
        };
      }

      // Send SMS via Twilio
      const smsOptions = {
        body: message,
        from: this.fromNumber,
        to: this.formatPhoneNumber(to),
        ...options
      };

      const response = await this.client.messages.create(smsOptions);

      logger.info('SMS sent successfully', {
        to: to,
        messageId: response.sid,
        status: response.status
      });

      return {
        success: true,
        messageId: response.sid,
        status: response.status,
        to: response.to,
        from: response.from,
        dateCreated: response.dateCreated
      };

    } catch (error) {
      logger.error('Error sending SMS', {
        to,
        error: error.message,
        code: error.code
      });

      return {
        success: false,
        error: error.message,
        code: error.code,
        to
      };
    }
  }

  // Send bulk SMS messages
  async sendBulkSMS(recipients, message, options = {}) {
    const results = [];
    
    for (const recipient of recipients) {
      const result = await this.sendSMS(recipient, message, options);
      results.push({
        recipient,
        ...result
      });
      
      // Add small delay to avoid rate limiting
      await this.delay(100);
    }
    
    return results;
  }

  // Validate phone number format
  isValidPhoneNumber(phoneNumber) {
    // International phone number validation - must start with + and country code
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  // Format phone number to E.164 format
  formatPhoneNumber(phoneNumber) {
    // If already in E.164 format (starts with +), return as-is
    if (phoneNumber.startsWith('+')) {
      return phoneNumber;
    }
    
    // Remove all non-numeric characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add +1 if it's a 10-digit US number
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    }
    
    // Add + if it starts with 1 and is 11 digits
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    }
    
    // For other international numbers, add + if not present
    return `+${cleaned}`;
  }

  // Send debt payoff reminder SMS
  async sendDebtPayoffReminder(phoneNumber, debtName, amount) {
    const message = `🎉 Congratulations! Your "${debtName}" debt (${amount}) has reached $0! Please log in to mark it as PAID OFF and celebrate this victory! 💪`;
    return await this.sendSMS(phoneNumber, message);
  }

  // Send debt milestone celebration SMS
  async sendDebtMilestoneSMS(phoneNumber, debtName, milestoneType, percentage) {
    let message = '';
    
    switch (milestoneType) {
      case 'first_debt_paid':
        message = `🎊 AMAZING! You just paid off your first debt: "${debtName}"! This is just the beginning of your debt-free journey! 🚀`;
        break;
      case 'debt_milestone_25':
        message = `🎯 Milestone Alert! You're now 25% debt-free! Keep up the incredible momentum! 💪`;
        break;
      case 'debt_milestone_50':
        message = `🔥 HALFWAY THERE! You're 50% debt-free! The finish line is in sight! 🏁`;
        break;
      case 'debt_milestone_75':
        message = `⭐ So close! You're 75% debt-free! Final stretch - you've got this! 💯`;
        break;
      case 'debt_free':
        message = `🎊 DEBT-FREE! 🎊 You did it! Complete financial freedom achieved! You're officially DEBT-FREE! 🏆✨`;
        break;
      default:
        message = `🎉 Debt milestone reached: ${percentage}% debt-free! Keep pushing forward! 💪`;
    }
    
    return await this.sendSMS(phoneNumber, message);
  }

  // Send payment reminder SMS
  async sendPaymentReminder(phoneNumber, debtName, dueDate, minPayment) {
    const message = `💳 Payment Reminder: Your "${debtName}" payment of ${minPayment} is due on ${dueDate}. Stay on track with your debt freedom journey! 💪`;
    return await this.sendSMS(phoneNumber, message);
  }

  // Send motivational SMS
  async sendMotivationalSMS(phoneNumber, userName) {
    const motivationalMessages = [
      `💪 ${userName}, every payment brings you closer to financial freedom! Keep going!`,
      `🎯 ${userName}, you're building incredible momentum! Your future self will thank you!`,
      `⭐ ${userName}, debt freedom isn't just a dream - it's your destiny! Stay focused!`,
      `🚀 ${userName}, you're stronger than your debts! Keep pushing forward!`,
      `🏆 ${userName}, champions are made in moments like these! You've got this!`
    ];
    
    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    return await this.sendSMS(phoneNumber, randomMessage);
  }

  // Check SMS service status
  getStatus() {
    return {
      isEnabled: this.isEnabled,
      hasCredentials: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
      fromNumber: this.fromNumber || 'Not configured'
    };
  }

  // Utility function for delays
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get SMS delivery status
  async getMessageStatus(messageId) {
    if (!this.isEnabled) {
      return { status: 'development', error: 'SMS service not enabled' };
    }

    try {
      const message = await this.client.messages(messageId).fetch();
      return {
        status: message.status,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage,
        dateCreated: message.dateCreated,
        dateUpdated: message.dateUpdated
      };
    } catch (error) {
      logger.error('Error fetching SMS status', error.message);
      return { status: 'error', error: error.message };
    }
  }
}

module.exports = new SMSService();
