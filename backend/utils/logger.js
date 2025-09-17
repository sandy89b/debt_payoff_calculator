const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.logLevel = process.env.LOG_LEVEL || 'info';
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const levelColor = this.getLevelColor(level);
    const levelText = level.toUpperCase().padEnd(5);
    
    let formattedMessage = `${colors.dim}[${timestamp}]${colors.reset} ${levelColor}[${levelText}]${colors.reset} ${message}`;
    
    if (data) {
      formattedMessage += ` ${colors.dim}${JSON.stringify(data)}${colors.reset}`;
    }
    
    return formattedMessage;
  }

  getLevelColor(level) {
    switch (level) {
      case 'error': return colors.red;
      case 'warn': return colors.yellow;
      case 'info': return colors.blue;
      case 'debug': return colors.magenta;
      default: return colors.white;
    }
  }

  shouldLog(level) {
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  error(message, data = null) {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, data));
    }
  }

  warn(message, data = null) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  info(message, data = null) {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, data));
    }
  }

  debug(message, data = null) {
    if (this.shouldLog('debug') && this.isDevelopment) {
      console.log(this.formatMessage('debug', message, data));
    }
  }

  // Special methods for auth operations
  authSuccess(operation, email) {
    this.info(`Auth ${operation} successful`, { email });
  }

  authError(operation, email, error) {
    this.error(`Auth ${operation} failed`, { email, error: error.message });
  }

  emailSent(type, email) {
    this.info(`Email sent: ${type}`, { email });
  }

  emailError(type, email, error) {
    this.error(`Email failed: ${type}`, { email, error: error.message });
  }

  devInfo(message, data = null) {
    if (this.isDevelopment) {
      console.log(`${colors.cyan}[DEV]${colors.reset} ${message}`, data || '');
    }
  }
}

module.exports = new Logger();
