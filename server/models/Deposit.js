
const mongoose = require("mongoose");

const depositSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 3000,
    },
    package: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["bank_transfer", "mobile_money"],
    },
    merchantAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MerchantAccount",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "rejected"],
      default: "pending",
    },
    receiptUrl: {
      type: String,
      default: null,
    },
    transactionReference: {
      type: String,
      default: null,
      required: true,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    processedAt: {
      type: Date,
      default: null,
    },
    isUpgraded: {
      type: Boolean,
      default: false,
    },
    upgradedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deposit",
      default: null,
    },
    upgradedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deposit",
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

// Calculate monthly return based on package
depositSchema.methods.getMonthlyReturn = function () {
  const returnRates = {
    "7th Stock Package": 192000,
        '6th Stock Package': 96000,
        '5th Stock Package': 48000,
        '4th Stock Package': 24000,
        '3rd Stock Package': 12000,
        '2nd Stock Package': 6000,
        '1st Stock Package': 3000
  };
  return returnRates[this.package] || 0;
};

module.exports = mongoose.model("Deposit", depositSchema);