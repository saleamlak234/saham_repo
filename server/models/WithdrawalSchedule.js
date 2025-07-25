const mongoose = require('mongoose');

const withdrawalScheduleSchema = new mongoose.Schema({
  startHour: {
    type: Number,
    // required: true,
    min: 0,
    max: 23,
    default: 4
  },
  endHour: {
    type: Number,
    // required: true,
    min: 0,
    max: 23,
    default: 11
  },
  isActive: {
    type: Boolean,
    default: true
  },
  timezone: {
    type: String,
    default: 'Africa/Addis_Ababa'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WithdrawalSchedule', withdrawalScheduleSchema);