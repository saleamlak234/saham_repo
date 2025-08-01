const mongoose = require('mongoose');

const packageUpgradeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalDeposit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deposit',
    required: true
  },
  upgradeDeposit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deposit',
    required: true
  },
  fromPackage: {
    type: String,
    required: true
  },
  toPackage: {
    type: String,
    required: true
  },
  upgradeAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PackageUpgrade', packageUpgradeSchema);