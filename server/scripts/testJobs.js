const { runDailyReturnsNow, runVipBonusesNow } = require('../jobs/scheduledJobs');
const { getEthiopianTime } = require('../utils/timeUtils');
const mongoose = require('mongoose');
require('dotenv').config();

async function testJobs() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for testing');
    
    console.log("=== TESTING CRON JOBS ===");
    console.log("Test run at:", new Date().toISOString());
    console.log("Ethiopian Time:", getEthiopianTime().format('YYYY-MM-DD HH:mm:ss [EAT]'));
    console.log("========================");

    // Test daily returns
    console.log("\n--- Testing Daily Returns Job ---");
    await runDailyReturnsNow();
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test VIP bonuses
    console.log("\n--- Testing VIP Bonuses Job ---");
    await runVipBonusesNow();
    
    console.log("\n=== ALL TESTS COMPLETED ===");
    console.log("Completion time:", new Date().toISOString());
    console.log("Ethiopian Time:", getEthiopianTime().format('YYYY-MM-DD HH:mm:ss [EAT]'));
    
  } catch (error) {
    console.error('Test jobs error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  testJobs();
}

module.exports = { testJobs };