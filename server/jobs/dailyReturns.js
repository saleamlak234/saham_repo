const cron = require('node-cron');
const Deposit = require('../models/Deposit');
const DailyReturn = require('../models/DailyReturn');
const User = require('../models/User');
const Commission = require('../models/Commission');
const { getEthiopianTime, getEthiopianDateString } = require('../utils/timeUtils');
const telegramService = require('../services/telegram');

// Package configurations with daily return percentages
const PACKAGE_CONFIG = {
  '7th Stock Package': { dailyReturn: 0.15, amount: 192000 },
  '6th Stock Package': { dailyReturn: 0.15, amount: 96000 },
  '5th Stock Package': { dailyReturn: 0.15, amount: 48000 },
  '4th Stock Package': { dailyReturn: 0.15, amount: 24000 },
  '3rd Stock Package': { dailyReturn: 0.15, amount: 12000 },
  '2nd Stock Package': { dailyReturn: 0.15, amount: 6000 },
  '1st Stock Package': { dailyReturn: 0.15, amount: 3000 }
};

// Daily return commission rates (1.5% total distributed across 4 levels)
const DAILY_COMMISSION_RATES = [0.006, 0.003, 0.002, 0.001]; // 0.6%, 0.3%, 0.2%, 0.1%

// Run daily returns job at 1:00 AM Ethiopian Time
cron.schedule('0 1 * * *', async () => {
  console.log('Running daily returns job at Ethiopian Time:', getEthiopianTime().format());
  await processDailyReturns();
}, {
  timezone: 'Africa/Addis_Ababa'
});

async function processDailyReturns() {
  try {
    const today = getEthiopianDateString();
    console.log(`Processing daily returns for ${today}`);

    // Get all completed deposits
    const completedDeposits = await Deposit.find({ 
      status: 'completed' 
    }).populate('user');

    let processedCount = 0;
    let totalReturnsAmount = 0;

    for (const deposit of completedDeposits) {
      try {
        // Check if daily return already processed for this deposit today
        const existingReturn = await DailyReturn.findOne({
          deposit: deposit._id,
          date: today
        });

        if (existingReturn) {
          console.log(`Daily return already processed for deposit ${deposit._id} on ${today}`);
          continue;
        }

        // Get package configuration
        const packageConfig = PACKAGE_CONFIG[deposit.package];
        if (!packageConfig) {
          console.log(`Unknown package: ${deposit.package}`);
          continue;
        }

        // Calculate daily return
        const dailyReturnAmount = deposit.amount * packageConfig.dailyReturn;

        // Create daily return record
        const dailyReturn = new DailyReturn({
          user: deposit.user._id,
          deposit: deposit._id,
          amount: dailyReturnAmount,
          returnPercentage: packageConfig.dailyReturn,
          date: today,
          status: 'paid'
        });

        await dailyReturn.save();

        // Add to user balance
        await User.findByIdAndUpdate(deposit.user._id, {
          $inc: { balance: dailyReturnAmount }
        });

        // Process daily return commissions
        await processDailyReturnCommissions(deposit, dailyReturnAmount);

        // Send notification to user
        if (deposit.user.telegramChatId) {
          await telegramService.sendMessage(
            deposit.user.telegramChatId,
            `💰 Daily Return Credited!\n\n` +
            `Package: ${deposit.package}\n` +
            `Amount: ${dailyReturnAmount.toLocaleString()} ETB\n` +
            `Date: ${today}\n` +
            `Your balance has been updated.`
          );
        }

        processedCount++;
        totalReturnsAmount += dailyReturnAmount;

        console.log(`Processed daily return for user ${deposit.user.fullName}: ${dailyReturnAmount} ETB`);

      } catch (error) {
        console.error(`Error processing daily return for deposit ${deposit._id}:`, error);
      }
    }

    console.log(`Daily returns job completed: ${processedCount} returns processed, total amount: ${totalReturnsAmount.toLocaleString()} ETB`);

  } catch (error) {
    console.error('Daily returns job error:', error);
  }
}

async function processDailyReturnCommissions(deposit, returnAmount) {
  try {
    const user = await User.findById(deposit.user).populate('referredBy');
    if (!user || !user.referredBy) return;

    let currentUser = user.referredBy;
    let level = 1;

    while (currentUser && level <= 4) {
      const commissionAmount = returnAmount * DAILY_COMMISSION_RATES[level - 1];
      
      // Create commission record
      const commission = new Commission({
        user: currentUser._id,
        fromUser: deposit.user,
        amount: commissionAmount,
        level,
        type: 'earning',
        description: `Level ${level} daily return commission from ${user.fullName}`,
        sourceTransaction: deposit._id,
        sourceModel: 'DailyReturn'
      });

      await commission.save();

      // Update user balance and commission total
      await User.findByIdAndUpdate(currentUser._id, {
        $inc: {
          balance: commissionAmount,
          totalCommissions: commissionAmount
        }
      });

      // Send notification
      if (currentUser.telegramChatId) {
        await telegramService.sendMessage(
          currentUser.telegramChatId,
          `💰 Daily Commission Earned!\n` +
          `Amount: ${commissionAmount.toLocaleString()} ETB\n` +
          `Level: ${level}\n` +
          `From: ${user.fullName}'s daily return`
        );
      }

      // Move to next level
      const nextUser = await User.findById(currentUser._id).populate('referredBy');
      currentUser = nextUser?.referredBy;
      level++;
    }
  } catch (error) {
    console.error('Daily return commission processing error:', error);
  }
}

// Export for manual testing
module.exports = { 
  processDailyReturns,
  PACKAGE_CONFIG,
  DAILY_COMMISSION_RATES
};