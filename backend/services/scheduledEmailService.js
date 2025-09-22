const cron = require('node-cron');
const userActivityService = require('./userActivityService');
const logger = require('../utils/logger');

class ScheduledEmailService {
  constructor() {
    this.jobs = [];
  }

  // Initialize all scheduled email jobs
  init() {
    try {
      // Check for inactive users daily at 10 AM
      const inactivityJob = cron.schedule('0 10 * * *', async () => {
        logger.info('Running daily inactive user check');
        await userActivityService.checkInactiveUsers();
      }, {
        scheduled: false,
        timezone: 'America/New_York'
      });
      
      // Send weekly check-ins every Monday at 9 AM
      const weeklyJob = cron.schedule('0 9 * * 1', async () => {
        logger.info('Running weekly check-in emails');
        await userActivityService.sendWeeklyCheckIns();
      }, {
        scheduled: false,
        timezone: 'America/New_York'
      });
      
      // Send monthly reports on the 1st of each month at 10 AM
      const monthlyJob = cron.schedule('0 10 1 * *', async () => {
        logger.info('Running monthly progress reports');
        await userActivityService.sendMonthlyReports();
      }, {
        scheduled: false,
        timezone: 'America/New_York'
      });
      
      this.jobs = [
        { name: 'inactivity-check', job: inactivityJob },
        { name: 'weekly-checkins', job: weeklyJob },
        { name: 'monthly-reports', job: monthlyJob }
      ];
      
      logger.info('Scheduled email jobs initialized');
      
    } catch (error) {
      logger.error('Error initializing scheduled email jobs', error.message);
    }
  }
  
  // Start all scheduled jobs
  start() {
    try {
      this.jobs.forEach(({ name, job }) => {
        job.start();
        logger.info(`Started scheduled job: ${name}`);
      });
      
      logger.info('All scheduled email jobs started');
      
    } catch (error) {
      logger.error('Error starting scheduled email jobs', error.message);
    }
  }
  
  // Stop all scheduled jobs
  stop() {
    try {
      this.jobs.forEach(({ name, job }) => {
        job.stop();
        logger.info(`Stopped scheduled job: ${name}`);
      });
      
      logger.info('All scheduled email jobs stopped');
      
    } catch (error) {
      logger.error('Error stopping scheduled email jobs', error.message);
    }
  }
  
  // Get status of all jobs
  getStatus() {
    return this.jobs.map(({ name, job }) => ({
      name,
      running: job.running || false,
      scheduled: job.scheduled || false
    }));
  }
  
  // Manual trigger for testing
  async triggerInactivityCheck() {
    try {
      logger.info('Manually triggering inactive user check');
      await userActivityService.checkInactiveUsers();
      return { success: true, message: 'Inactivity check completed' };
    } catch (error) {
      logger.error('Error in manual inactivity check', error.message);
      return { success: false, message: error.message };
    }
  }
  
  async triggerWeeklyCheckIns() {
    try {
      logger.info('Manually triggering weekly check-ins');
      await userActivityService.sendWeeklyCheckIns();
      return { success: true, message: 'Weekly check-ins completed' };
    } catch (error) {
      logger.error('Error in manual weekly check-ins', error.message);
      return { success: false, message: error.message };
    }
  }
  
  async triggerMonthlyReports() {
    try {
      logger.info('Manually triggering monthly reports');
      await userActivityService.sendMonthlyReports();
      return { success: true, message: 'Monthly reports completed' };
    } catch (error) {
      logger.error('Error in manual monthly reports', error.message);
      return { success: false, message: error.message };
    }
  }
}

module.exports = new ScheduledEmailService();
