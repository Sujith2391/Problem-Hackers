const cron = require('node-cron');
const supabase = require('../utils/supabase');
const emailService = require('./email.service');
const { format, addDays } = require('date-fns');

class CronService {
  constructor() {
    this.jobs = [];
  }

  // Send meal reminders at 9 PM daily
  startMealReminders() {
    // Schedule for 9:00 PM daily (21:00)
    const job = cron.schedule('0 21 * * *', async () => {
      console.log('Running meal reminder cron job...');
      await this.sendMealReminders();
    }, {
      timezone: "Asia/Kolkata" // Adjust timezone as needed
    });

    this.jobs.push(job);
    console.log('Meal reminder cron job scheduled for 9:00 PM daily');
  }

  async sendMealReminders() {
    try {
      const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

      // Get all users who haven't confirmed meals for tomorrow
      const { data: unconfirmedUsers, error } = await supabase
        .from('meal_confirmations')
        .select(`
          user_id,
          users!inner(email, full_name)
        `)
        .eq('date', tomorrow)
        .eq('confirmed', false);

      if (error) throw error;

      // Group by user to avoid duplicate emails
      const userMap = {};
      unconfirmedUsers.forEach(record => {
        if (!userMap[record.user_id]) {
          userMap[record.user_id] = {
            email: record.users.email,
            full_name: record.users.full_name
          };
        }
      });

      const usersToRemind = Object.values(userMap);

      // Send reminder emails
      for (const user of usersToRemind) {
        await emailService.sendMealReminder(user.email, user.full_name, tomorrow);
      }

      console.log(`Sent meal reminders to ${usersToRemind.length} users`);

    } catch (error) {
      console.error('Error sending meal reminders:', error);
    }
  }

  // Start all cron jobs
  startAll() {
    this.startMealReminders();
  }

  // Stop all cron jobs
  stopAll() {
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
    console.log('All cron jobs stopped');
  }
}

module.exports = new CronService();
