const mongoose = require('mongoose');

const videoRewardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  amount: {
    type: Number,
    default: 20,
    required: true
  },
  viewDate: {
    type: String, // YYYY-MM-DD
    required: true
  },
  viewCount: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Compound index: one reward record per user per video per day
videoRewardSchema.index({ userId: 1, videoId: 1, viewDate: 1 }, { unique: true });

module.exports = mongoose.model('VideoReward', videoRewardSchema);
