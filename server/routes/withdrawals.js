
const express = require("express");
const Withdrawal = require("../models/Withdrawal");
const WithdrawalSchedule = require("../models/WithdrawalSchedule");
const User = require("../models/User");
const telegramService = require("../services/telegram");

const router = express.Router();

// VAT rate (15%)
const VAT_RATE = 0.15;

// Predefined withdrawal packages
const WITHDRAWAL_PACKAGES = [
  { id: "basic", amount: 200, label: "Basic Package" },
  { id: "starter", amount: 700, label: "Starter Package" },
  { id: "standard", amount: 2000, label: "Standard Package" },
  { id: "premium", amount: 7000, label: "Premium Package" },
  { id: "advanced", amount: 20000, label: "Advanced Package" },
  { id: "professional", amount: 70000, label: "Professional Package" },
  { id: "enterprise", amount: 200000, label: "Enterprise Package" },
  { id: "elite", amount: 700000, label: "Elite Package" },
];

// Check withdrawal schedule
const isWithdrawalAllowed = async () => {
  try {
    const schedule = await WithdrawalSchedule.findOne({ isActive: true });
    if (!schedule) return true; // If no schedule set, allow withdrawals

    const now = new Date();
    const currentHour = now.getHours();

    return currentHour >= schedule.startHour && currentHour <= schedule.endHour;
  } catch (error) {
    console.error("Withdrawal schedule check error:", error);
    return false;
  }
};

// Check if user has already withdrawn today
const hasWithdrawnToday = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayWithdrawal = await Withdrawal.findOne({
    user: userId,
    createdAt: {
      $gte: today,
      $lt: tomorrow,
    },
  });

  return !!todayWithdrawal;
};

// Validate package
const validatePackage = (packageId) => {
  return WITHDRAWAL_PACKAGES.find((pkg) => pkg.id === packageId);
};

// Get withdrawal schedule
router.get("/schedule", async (req, res) => {
  try {
    const schedule = await WithdrawalSchedule.findOne({ isActive: true });
    res.json({ schedule });
  } catch (error) {
    console.error("Get withdrawal schedule error:", error);
    res
      .status(500)
      .json({ message: "Server error fetching withdrawal schedule" });
  }
});

// Get user withdrawals
router.get("/", async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({ withdrawals });
  } catch (error) {
    console.error("Get withdrawals error:", error);
    res.status(500).json({ message: "Server error fetching withdrawals" });
  }
});

// Create withdrawal request
router.post("/", async (req, res) => {
  try {
    const { packageId, amount, paymentMethod, accountDetails } = req.body;
    const userId = req.user._id;

    // Validate package
    const packageData = validatePackage(packageId);
    if (!packageData) {
      return res
        .status(400)
        .json({ message: "Invalid withdrawal package selected" });
    }

    // Verify amount matches package
    if (amount !== packageData.amount) {
      return res
        .status(400)
        .json({ message: "Amount does not match selected package" });
    }

    // Check withdrawal schedule
    const isAllowed = await isWithdrawalAllowed();
    if (isAllowed) {
      const schedule = await WithdrawalSchedule.findOne({ isActive: true });
      return res.status(400).json({
        message: `Withdrawals are only allowed between ${
          schedule?.startHour || 4
        }:00 and ${schedule?.endHour || 11}:00`,
      });
    }

    // Check if user has already withdrawn today
    const alreadyWithdrawn = await hasWithdrawnToday(userId);
    if (alreadyWithdrawn) {
      return res.status(400).json({
        message: "You can only make one withdrawal per day",
      });
    }

    // Validate minimum amount
    if (amount < 200) {
      return res
        .status(400)
        .json({ message: "Minimum withdrawal amount is 200 ETB" });
    }

    if (amount > req.user.balance) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Calculate VAT and net amount
    const vatAmount = amount * VAT_RATE;
    const netAmount = amount - vatAmount;

    // Validate account details
    if (paymentMethod === "bank") {
      if (!accountDetails.accountNumber || !accountDetails.bankName) {
        return res
          .status(400)
          .json({ message: "Bank account details are required" });
      }
    } else if (paymentMethod === "telebirr") {
      if (!accountDetails.phoneNumber) {
        return res
          .status(400)
          .json({ message: "Phone number is required for TeleBirr" });
      }
    }

    // Create withdrawal request
    const withdrawal = new Withdrawal({
      user: userId,
      packageId,
      packageLabel: packageData.label,
      amount,
      vatAmount,
      netAmount,
      paymentMethod,
      accountDetails,
    });

    await withdrawal.save();

    // Deduct amount from user balance (pending withdrawal)
    await User.findByIdAndUpdate(userId, {
      $inc: { balance: -amount },
    });

    // Send notification to admin
    await telegramService.sendToAdmin(
      `💸 New withdrawal request:\n` +
        `User: ${req.user.fullName}\n` +
        `Package: ${packageData.label}\n` +
        `Gross Amount: ${amount.toLocaleString()} ETB\n` +
        `VAT (15%): ${vatAmount.toLocaleString()} ETB\n` +
        `Net Amount: ${netAmount.toLocaleString()} ETB\n` +
        `Method: ${paymentMethod}\n` +
        `Details: ${JSON.stringify(accountDetails, null, 2)}`
    );

    res.status(201).json({
      message: "Withdrawal request submitted successfully",
      withdrawal: {
        ...withdrawal.toObject(),
        vatAmount,
        netAmount,
      },
    });
  } catch (error) {
    console.error("Create withdrawal error:", error);
    res
      .status(500)
      .json({ message: "Server error creating withdrawal request" });
  }
});

module.exports = router;