const cron = require('node-cron');
const { getEthiopianTime } = require('../utils/timeUtils');

// Test job that runs every minute for testing
cron.schedule('* * * * *', () => {
  console.log("=== CRON TEST ===");
  console.log("Test run at:", new Date().toISOString());
  console.log("Ethiopian Time:", getEthiopianTime().format('YYYY-MM-DD HH:mm:ss [EAT]'));
  console.log("UTC Time:", new Date().toUTCString());
  console.log("Local Time:", new Date().toString());
  console.log("================");
}, {
  timezone: 'Africa/Addis_Ababa'
});

// Test job that runs at midnight Ethiopian Time
cron.schedule('0 0 * * *', () => {
  console.log("=== MIDNIGHT TEST JOB ===");
  console.log("Midnight test run at:", new Date().toISOString());
  console.log("Ethiopian Midnight:", getEthiopianTime().format('YYYY-MM-DD HH:mm:ss [EAT]'));
  console.log("========================");
}, {
  timezone: 'Africa/Addis_Ababa'
});

// Test job that runs every 5 minutes
cron.schedule('*/5 * * * *', () => {
  console.log("=== 5-MINUTE TEST ===");
  console.log("5-minute test run at:", new Date().toISOString());
  console.log("Ethiopian Time:", getEthiopianTime().format('YYYY-MM-DD HH:mm:ss [EAT]'));
  console.log("===================");
}, {
  timezone: 'Africa/Addis_Ababa'
});

console.log("Test cron jobs initialized for Ethiopian timezone");
console.log("Current Ethiopian Time:", getEthiopianTime().format('YYYY-MM-DD HH:mm:ss [EAT]'));
console.log("Current UTC Time:", new Date().toISOString());

module.exports = {};