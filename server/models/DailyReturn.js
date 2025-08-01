const mongoose = require('mongoose');

const dailyReturnSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deposit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deposit',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  returnPercentage: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'paid'
  },
  processedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate returns for same deposit/date
dailyReturnSchema.index({ deposit: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyReturn', dailyReturnSchema);