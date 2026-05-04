const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const upload = require('../middleware/upload');
const PaymentRequest = require('../models/PaymentRequest');
const Deposit = require('../models/Deposit');
const User = require('../models/User');
const Commission = require('../models/Commission');

// Deposit commission rates per generation
const COMMISSION_RATES = { 1: 0.08, 2: 0.06, 3: 0.04 };
const DAILY_COMMISSION_RATES = { 1: 0.05, 2: 0.03, 3: 0.01 };

// Helper: pay commissions up the 3-gen chain when deposit is approved
async function distributeCommissions(deposit) {
  const User = require('../models/User');
  let current = await User.findById(deposit.user);
  for (let gen = 1; gen <= 3; gen++) {
    if (!current || !current.referredBy) break;
    const upline = await User.findById(current.referredBy);
    if (!upline) break;

    const rate = COMMISSION_RATES[gen];
    const commAmount = deposit.amount * rate;

    await Commission.create({
      user: upline._id,
      fromUser: deposit.user,
      amount: commAmount,
      level: gen,
      type: 'deposit',
      description: `Gen ${gen} commission from ${current.fullName}'s deposit`,
      sourceTransaction: deposit._id,
      sourceModel: 'Deposit'
    });

    // Calculate debt for upline
    // Debt = (deposit after taking 8% commission) - upline's current total balance
    const depositAfterSelfCommission = deposit.amount * 0.92; // 8% kept by gen-1 upline
    const uplineBalance = upline.balance + upline.totalCommissions;
    const debtOwed = Math.max(0, depositAfterSelfCommission - uplineBalance);

    if (debtOwed > 0 && gen === 1) {
      // Only gen-1 (direct upline) gets the debt mechanism
      upline.debtAmount = (upline.debtAmount || 0) + debtOwed;
      upline.isDashboardLocked = true;
      upline.debtToUplineId = upline.referredBy || null;
    } else {
      upline.balance += commAmount;
      upline.totalCommissions += commAmount;
    }
    await upline.save();

    current = upline;
  }
}

// POST /api/payments/submit-deposit
// Child submits deposit receipt to parent for approval
router.post('/submit-deposit', upload.single('receipt'), async (req, res) => {
  try {
    const {
      packageLevel,
      transactionReference,
      methodType,
      bankName,
      phoneNumber,
      accountNumber,
      accountName
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Receipt file is required' });
    }

    const user = await User.findById(req.user._id).populate('referredBy');
    if (!user.referredBy) {
      return res.status(400).json({ message: 'No upline found. Contact admin.' });
    }

    const PACKAGES = {
      1: 2500, 2: 5000, 3: 10000, 4: 20000,
      5: 40000, 6: 80000, 7: 160000, 8: 320000
    };
    const pkgLvl = parseInt(packageLevel);
    const packagePrice = PACKAGES[pkgLvl];
    if (!packagePrice) {
      return res.status(400).json({ message: 'Invalid package level' });
    }

    // Create Deposit record (pending until parent approves)
    const deposit = await Deposit.create({
      user: req.user._id,
      amount: packagePrice,
      package: `Package Level ${pkgLvl}`,
      packageLevel: pkgLvl,
      paymentMethod: 'bank_transfer',
      merchantAccount: null,
      uplineId: user.referredBy._id,
      status: 'pending',
      receiptUrl: `/uploads/receipts/${req.file.filename}`,
      receiptFileName: req.file.filename,
      transactionReference,
      commissionAmount: packagePrice * 0.08
    });

    // Create PaymentRequest for parent to see
    const paymentRequest = await PaymentRequest.create({
      fromUserId: req.user._id,
      toUserId: user.referredBy._id,
      amount: packagePrice,
      debtAmount: 0,
      type: 'deposit_payment',
      selectedPaymentMethod: {
        methodType: methodType || 'bank',
        bankName: bankName || '',
        phoneNumber: phoneNumber || '',
        accountNumber: accountNumber || '',
        accountName: accountName || ''
      },
      referenceNumber: transactionReference,
      receiptUrl: `/uploads/receipts/${req.file.filename}`,
      receiptFileName: req.file.filename,
      relatedDepositId: deposit._id
    });

    res.json({
      success: true,
      message: 'Deposit submitted. Waiting for parent approval.',
      deposit,
      paymentRequest
    });
  } catch (error) {
    if (req.file) {
      fs.unlink(path.join(__dirname, '../uploads/receipts', req.file.filename), () => {});
    }
    console.error('Submit deposit error:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/payments/pending - Parent sees pending payment requests from children
router.get('/pending', async (req, res) => {
  try {
    const payments = await PaymentRequest.find({
      toUserId: req.user._id,
      status: 'pending'
    })
      .populate('fromUserId', 'fullName email phoneNumber referralCode')
      .populate('relatedDepositId')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/payments/history - User's own submitted payments
router.get('/history', async (req, res) => {
  try {
    const payments = await PaymentRequest.find({
      fromUserId: req.user._id
    })
      .populate('toUserId', 'fullName email')
      .populate('relatedDepositId')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/payments/upline-payment-info - Get upline's payment info for making payment
router.get('/upline-payment-info', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('referredBy', 'fullName email paymentInfo');
    if (!user.referredBy) {
      return res.status(404).json({ message: 'No upline found' });
    }
    res.json(user.referredBy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/payments/receipt/:paymentId - View/download receipt
router.get('/receipt/:paymentId', async (req, res) => {
  try {
    const payment = await PaymentRequest.findById(req.params.paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    const isOwner = payment.fromUserId.toString() === req.user._id.toString();
    const isParent = payment.toUserId.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'super_admin', 'transaction_admin'].includes(req.user.role);

    if (!isOwner && !isParent && !isAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const filePath = path.join(__dirname, '../', payment.receiptUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    const download = req.query.download === 'true';
    if (download) {
      return res.download(filePath, payment.receiptFileName || 'receipt');
    }
    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/payments/approve/:paymentId - Parent approves
router.post('/approve/:paymentId', async (req, res) => {
  try {
    const payment = await PaymentRequest.findById(req.params.paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    if (payment.toUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the parent can approve this payment' });
    }
    if (payment.status !== 'pending') {
      return res.status(400).json({ message: 'Payment already processed' });
    }

    payment.status = 'approved';
    payment.approvedBy = req.user._id;
    payment.approvedAt = new Date();
    await payment.save();

    // Approve the related deposit
    if (payment.relatedDepositId) {
      const deposit = await Deposit.findById(payment.relatedDepositId);
      if (deposit) {
        deposit.status = 'completed';
        deposit.approvedBy = req.user._id;
        deposit.approvedAt = new Date();
        deposit.commissionPaid = true;
        await deposit.save();

        // Distribute commissions up 3 generations
        await distributeCommissions(deposit);

        // Update child's total deposits
        await User.findByIdAndUpdate(deposit.user, {
          $inc: { totalDeposits: deposit.amount }
        });

        // Update parent direct referral count if first deposit
        const existingDeposits = await Deposit.countDocuments({
          user: deposit.user,
          status: 'completed'
        });
        if (existingDeposits === 1) {
          await User.findByIdAndUpdate(req.user._id, {
            $inc: { directReferrals: 1, totalTeamSize: 1 }
          });
        }
      }
    }

    res.json({ success: true, message: 'Payment approved successfully', payment });
  } catch (error) {
    console.error('Approve payment error:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/payments/reject/:paymentId - Parent rejects
router.post('/reject/:paymentId', async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const payment = await PaymentRequest.findById(req.params.paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    if (payment.toUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the parent can reject this payment' });
    }
    if (payment.status !== 'pending') {
      return res.status(400).json({ message: 'Payment already processed' });
    }

    payment.status = 'rejected';
    payment.rejectionReason = rejectionReason || 'Receipt not valid';
    await payment.save();

    // Reject the deposit
    if (payment.relatedDepositId) {
      await Deposit.findByIdAndUpdate(payment.relatedDepositId, {
        status: 'rejected',
        rejectionReason: payment.rejectionReason
      });
    }

    res.json({ success: true, message: 'Payment rejected', payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/payments/submit-debt-payment - Child pays debt to upline
router.post('/submit-debt-payment', upload.single('receipt'), async (req, res) => {
  try {
    const { methodType, bankName, phoneNumber, accountNumber, accountName, referenceNumber } = req.body;

    if (!req.file) return res.status(400).json({ message: 'Receipt is required' });

    const user = await User.findById(req.user._id).populate('referredBy');
    if (!user.isDashboardLocked || user.debtAmount <= 0) {
      return res.status(400).json({ message: 'No outstanding debt found' });
    }

    const paymentRequest = await PaymentRequest.create({
      fromUserId: req.user._id,
      toUserId: user.debtToUplineId || user.referredBy?._id,
      amount: user.debtAmount,
      debtAmount: user.debtAmount,
      type: 'deposit_payment',
      selectedPaymentMethod: {
        methodType: methodType || 'bank',
        bankName: bankName || '',
        phoneNumber: phoneNumber || '',
        accountNumber: accountNumber || '',
        accountName: accountName || ''
      },
      referenceNumber,
      receiptUrl: `/uploads/receipts/${req.file.filename}`,
      receiptFileName: req.file.filename
    });

    res.json({
      success: true,
      message: 'Debt payment submitted. Waiting for parent approval.',
      paymentRequest
    });
  } catch (error) {
    if (req.file) {
      fs.unlink(path.join(__dirname, '../uploads/receipts', req.file.filename), () => {});
    }
    res.status(500).json({ message: error.message });
  }
});

// POST /api/payments/approve-debt/:paymentId - Parent approves debt payment
router.post('/approve-debt/:paymentId', async (req, res) => {
  try {
    const payment = await PaymentRequest.findById(req.params.paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    if (payment.toUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    if (payment.status !== 'pending') {
      return res.status(400).json({ message: 'Already processed' });
    }

    payment.status = 'approved';
    payment.approvedBy = req.user._id;
    payment.approvedAt = new Date();
    await payment.save();

    // Unlock child's dashboard
    await User.findByIdAndUpdate(payment.fromUserId, {
      debtAmount: 0,
      isDashboardLocked: false,
      debtToUplineId: null
    });

    // Credit the received amount to parent's balance
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { balance: payment.amount }
    });

    res.json({ success: true, message: 'Debt payment approved. Dashboard unlocked.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
