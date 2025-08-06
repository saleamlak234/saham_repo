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
    required: true,
    default: 0.15 // 15% daily return
  },
  date: {
    type: String, // Store as YYYY-MM-DD string for Ethiopian date
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
  },
  commissionsDistributed: {
    type: Number,
    default: 0
  },
  commissionBreakdown: {
    level1: { type: Number, default: 0 },
    level2: { type: Number, default: 0 },
    level3: { type: Number, default: 0 },
    level4: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate returns for same deposit/date
dailyReturnSchema.index({ deposit: 1, date: 1 }, { unique: true });

// Index for efficient querying
dailyReturnSchema.index({ user: 1, date: -1 });
dailyReturnSchema.index({ date: -1 });

module.exports = mongoose.model('DailyReturn', dailyReturnSchema);