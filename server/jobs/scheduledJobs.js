const cronScheduler = require('../utils/cronScheduler');
const { processDailyReturns } = require('./dailyReturns');
const { processVipBonuses } = require('./vipBonuses');
const { getEthiopianTime } = require('../utils/timeUtils');

// Initialize all scheduled jobs
function initializeScheduledJobs() {
  console.log("Initializing scheduled jobs with Ethiopian timezone...");
  console.log("Current Ethiopian Time:", getEthiopianTime().format('YYYY-MM-DD HH:mm:ss [EAT]'));
  console.log("Current UTC Time:", new Date().toISOString());

  // Daily Returns - Run at midnight (00:00) Ethiopian Time
  cronScheduler.scheduleDailyMidnight('daily-returns', async () => {
    console.log("=== DAILY RETURNS JOB ===");
    console.log("Test run at:", new Date().toISOString());
    await processDailyReturns();
  });

  // Alternative: Daily Returns at 1:00 AM
  cronScheduler.scheduleDailyAt('daily-returns-1am', 1, 0, async () => {
    console.log("=== DAILY RETURNS JOB (1:00 AM) ===");
    console.log("Test run at:", new Date().toISOString());
    await processDailyReturns();
  });

  // VIP Bonuses - Run on 1st of month at midnight
  cronScheduler.scheduleMonthlyMidnight('vip-bonuses', async () => {
    console.log("=== VIP BONUSES JOB ===");
    console.log("Test run at:", new Date().toISOString());
    await processVipBonuses();
  });

  // Monthly Salary Bonuses - Run on 1st of month at 2:00 AM
  cronScheduler.scheduleDailyAt('monthly-salary', 2, 0, async () => {
    const now = new Date();
    if (now.getDate() === 1) {
      console.log("=== MONTHLY SALARY JOB ===");
      await calculateMonthlySalaries();
    }
  });

  // Daily Statistics Update - Run at 2:00 AM
  cronScheduler.scheduleDailyAt('daily-stats', 2, 0, async () => {
    console.log("=== DAILY STATISTICS JOB ===");
    console.log("Test run at:", new Date().toISOString());
    await updateDailyStatistics();
  });

  // Daily Cleanup - Run at 3:00 AM
  cronScheduler.scheduleDailyAt('daily-cleanup', 3, 0, async () => {
    console.log("=== DAILY CLEANUP JOB ===");
    console.log("Test run at:", new Date().toISOString());
    await performDailyCleanup();
  });

  // Start all jobs
  cronScheduler.startAllJobs();

  // Log job status
  const jobs = cronScheduler.listJobs();
  console.log("Scheduled jobs status:", jobs);
}

async function updateDailyStatistics() {
  console.log("Updating daily platform statistics...");
  // Add your daily statistics logic here
  
  // Example: Update user activity stats, calculate platform metrics, etc.
  const User = require('../models/User');
  const Deposit = require('../models/Deposit');
  
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalDeposits = await Deposit.countDocuments({ status: 'completed' });
    
    console.log("Daily Stats Updated:", {
      totalUsers,
      activeUsers,
      totalDeposits,
      timestamp: getEthiopianTime().format('YYYY-MM-DD HH:mm:ss [EAT]')
    });
  } catch (error) {
    console.error("Error updating daily statistics:", error);
  }
}

async function performDailyCleanup() {
  console.log("Performing daily cleanup tasks...");
  
  try {
    // Example cleanup tasks
    // 1. Clean up old temporary files
    // 2. Archive old logs
    // 3. Update user activity status
    
    console.log("Daily cleanup completed at:", getEthiopianTime().format('YYYY-MM-DD HH:mm:ss [EAT]'));
  } catch (error) {
    console.error("Error during daily cleanup:", error);
  }
}

// Manual job execution functions for testing
async function runDailyReturnsNow() {
  console.log("=== MANUAL DAILY RETURNS EXECUTION ===");
  console.log("Test run at:", new Date().toISOString());
  console.log("Ethiopian Time:", getEthiopianTime().format('YYYY-MM-DD HH:mm:ss [EAT]'));
  await processDailyReturns();
}

async function runVipBonusesNow() {
  console.log("=== MANUAL VIP BONUSES EXECUTION ===");
  console.log("Test run at:", new Date().toISOString());
  console.log("Ethiopian Time:", getEthiopianTime().format('YYYY-MM-DD HH:mm:ss [EAT]'));
  await processVipBonuses();
}

// Monthly salary calculation based on direct referrals and team size
// Table: 13 directs->10k, 20->17k, 30->25k, 40->35k, 40+500team->80k, 40+1000team->150k
async function calculateMonthlySalaries() {
  const User = require('../models/User');
  try {
    const users = await User.find({ role: 'user', isActive: true });
    let updated = 0;
    for (const user of users) {
      let salary = 0;
      const d = user.directReferrals;
      const t = user.totalTeamSize;

      if (d >= 40 && t >= 1000) salary = 150000;
      else if (d >= 40 && t >= 500) salary = 80000;
      else if (d >= 40) salary = 35000;
      else if (d >= 30) salary = 25000;
      else if (d >= 20) salary = 17000;
      else if (d >= 13) salary = 10000;

      if (salary > 0) {
        await User.findByIdAndUpdate(user._id, {
          $inc: { monthlyBalance: salary }
        });
        updated++;
      }
    }
    console.log(`Monthly salaries calculated for ${updated} users`);
  } catch (error) {
    console.error('Monthly salary calculation error:', error);
  }
}

module.exports = {
  initializeScheduledJobs,
  updateDailyStatistics,
  performDailyCleanup,
  runDailyReturnsNow,
  runVipBonusesNow,
  cronScheduler
};