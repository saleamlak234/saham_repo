const cron = require('node-cron');
const { getEthiopianTime, getEthiopianDateString } = require('../utils/timeUtils');

// Run daily at midnight Ethiopian Time (00:00 EAT)
cron.schedule('0 0 * * *', async () => {
  const currentTime = getEthiopianTime();
  console.log("Daily midnight job started at:", currentTime.format('YYYY-MM-DD HH:mm:ss [EAT]'));
  console.log("Test run at:", new Date().toISOString());
  
  try {
    await runDailyMidnightTasks();
    console.log("Daily midnight job completed successfully at:", getEthiopianTime().format('YYYY-MM-DD HH:mm:ss [EAT]'));
  } catch (error) {
    console.error("Daily midnight job failed:", error);
  }
}, {
  timezone: 'Africa/Addis_Ababa'
});

// Alternative: Run at a specific time (e.g., 12:30 AM)
cron.schedule('30 0 * * *', async () => {
  console.log("Custom midnight job at 12:30 AM EAT:", getEthiopianTime().format());
  console.log("Test run at:", new Date().toISOString());
}, {
  timezone: 'Africa/Addis_Ababa'
});

// Test job that runs every minute (for testing purposes)
cron.schedule('* * * * *', () => {
  console.log("Test run every minute at:", new Date().toISOString());
  console.log("Ethiopian Time:", getEthiopianTime().format('YYYY-MM-DD HH:mm:ss [EAT]'));
}, {
  timezone: 'Africa/Addis_Ababa'
});

async function runDailyMidnightTasks() {
  const today = getEthiopianDateString();
  console.log(`Processing daily tasks for ${today}`);

  // Add your daily tasks here
  await performDailyCleanup();
  await updateDailyStatistics();
  await sendDailyReports();
  
  console.log("All daily midnight tasks completed");
}

async function performDailyCleanup() {
  console.log("Performing daily cleanup...");
  // Add cleanup logic here
  // Example: Clean up old logs, temporary files, etc.
}

async function updateDailyStatistics() {
  console.log("Updating daily statistics...");
  // Add statistics update logic here
  // Example: Calculate daily platform metrics
}

async function sendDailyReports() {
  console.log("Sending daily reports...");
  // Add reporting logic here
  // Example: Send daily summary to admins
}

// Export for manual testing
module.exports = { 
  runDailyMidnightTasks,
  performDailyCleanup,
  updateDailyStatistics,
  sendDailyReports
};