const mongoose = require('mongoose');

const paymentRequestSchema = new mongoose.Schema({
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  debtAmount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['deposit_payment'],
    required: true,
    default: 'deposit_payment'
  },
  selectedPaymentMethod: {
    methodType: {
      type: String,
      enum: ['bank', 'telebirr', 'cbeBirr'],
      required: true
    },
    bankName: { type: String, default: '' },
    phoneNumber: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    accountName: { type: String, default: '' }
  },
  referenceNumber: {
    type: String,
    required: true
  },
  receiptUrl: {
    type: String,
    default: null
  },
  receiptFileName: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    default: null
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  relatedDepositId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deposit',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PaymentRequest', paymentRequestSchema);
