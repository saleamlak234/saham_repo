const moment = require('moment-timezone');

const ETHIOPIA_TIMEZONE = 'Africa/Addis_Ababa';

// Get current Ethiopian time
const getEthiopianTime = () => {
  return moment().tz(ETHIOPIA_TIMEZONE);
};

// Check if current time is within withdrawal window (4:00 AM - 11:00 AM EAT)
const isWithdrawalTimeAllowed = () => {
  const now = getEthiopianTime();
  const currentHour = now.hour();
  return currentHour >= 4 && currentHour <= 11;
};

// Get next withdrawal window start time
const getNextWithdrawalWindow = () => {
  const now = getEthiopianTime();
  const nextWindow = now.clone();
  
  if (now.hour() >= 11) {
    // After 11 AM, next window is tomorrow at 4 AM
    nextWindow.add(1, 'day').hour(4).minute(0).second(0);
  } else if (now.hour() < 4) {
    // Before 4 AM, next window is today at 4 AM
    nextWindow.hour(4).minute(0).second(0);
  } else {
    // Currently in window, return current time
    return now;
  }
  
  return nextWindow;
};

// Get Ethiopian date string (YYYY-MM-DD)
const getEthiopianDateString = (date = null) => {
  const targetDate = date ? moment(date).tz(ETHIOPIA_TIMEZONE) : getEthiopianTime();
  return targetDate.format('YYYY-MM-DD');
};

// Check if it's time for daily processing (runs at 1:00 AM EAT)
const isDailyProcessingTime = () => {
  const now = getEthiopianTime();
  return now.hour() === 1 && now.minute() === 0;
};

module.exports = {
  getEthiopianTime,
  isWithdrawalTimeAllowed,
  getNextWithdrawalWindow,
  getEthiopianDateString,
  isDailyProcessingTime,
  ETHIOPIA_TIMEZONE
};