const cron = require('node-cron');
const Deposit = require('../models/Deposit');
const DailyReturn = require('../models/DailyReturn');
const User = require('../models/User');
const Commission = require('../models/Commission');
const { getEthiopianTime, getEthiopianDateString } = require('../utils/timeUtils');
const telegramService = require('../services/telegram');

// Package configurations with 15% daily return
const PACKAGE_CONFIG = {
  '7th Stock Package': { dailyReturn: 0.15, amount: 192000 },
  '6th Stock Package': { dailyReturn: 0.15, amount: 96000 },
  '5th Stock Package': { dailyReturn: 0.15, amount: 48000 },
  '4th Stock Package': { dailyReturn: 0.15, amount: 24000 },
  '3rd Stock Package': { dailyReturn: 0.15, amount: 12000 },
  '2nd Stock Package': { dailyReturn: 0.15, amount: 6000 },
  '1st Stock Package': { dailyReturn: 0.15, amount: 3000 }
};

// Daily return commission rates (15% total distributed across 4 levels)
const DAILY_COMMISSION_RATES = [0.08, 0.04, 0.02, 0.01]; // 8%, 4%, 2%, 1%

// Run daily returns job at midnight (00:00) Ethiopian Time
cron.schedule('0 0 * * *', async () => {
  const currentTime = getEthiopianTime();
  console.log('=== DAILY RETURNS JOB STARTED ===');
  console.log('Ethiopian Time:', currentTime.format('YYYY-MM-DD HH:mm:ss [EAT]'));
  console.log('UTC Time:', new Date().toISOString());
  console.log('Test run at:', new Date().toISOString());
  await processDailyReturns();
}, {
  timezone: 'Africa/Addis_Ababa'
});

async function processDailyReturns() {
  try {
    const today = getEthiopianDateString();
    console.log(`Processing daily returns for ${today}`);
    console.log('Ethiopian Time:', getEthiopianTime().format('YYYY-MM-DD HH:mm:ss [EAT]'));
    console.log('UTC Time:', new Date().toISOString());

    // Get all completed deposits
    const completedDeposits = await Deposit.find({ 
      status: 'completed' 
    }).populate('user');

    let processedCount = 0;
    let totalReturnsAmount = 0;
    let totalCommissionsDistributed = 0;

    console.log(`Found ${completedDeposits.length} completed deposits to process`);

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
          console.log(`Unknown package: ${deposit.package} for deposit ${deposit._id}`);
          continue;
        }

        // Calculate 15% daily return
        const dailyReturnAmount = deposit.amount * packageConfig.dailyReturn;

        console.log(`Processing deposit ${deposit._id}:`);
        console.log(`- User: ${deposit.user.fullName}`);
        console.log(`- Package: ${deposit.package}`);
        console.log(`- Deposit Amount: ${deposit.amount.toLocaleString()} ETB`);
        console.log(`- Daily Return (15%): ${dailyReturnAmount.toLocaleString()} ETB`);

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

        // Process daily return commissions (15% distributed across 4 levels)
        const commissionsDistributed = await processDailyReturnCommissions(deposit, dailyReturnAmount);
        totalCommissionsDistributed += commissionsDistributed;

        // Send notification to user
        if (deposit.user.telegramChatId) {
          await telegramService.sendMessage(
            deposit.user.telegramChatId,
            `💰 Daily Return Credited!\n\n` +
            `Package: ${deposit.package}\n` +
            `Daily Return (15%): ${dailyReturnAmount.toLocaleString()} ETB\n` +
            `Date: ${today}\n` +
            `Your balance has been updated.\n\n` +
            `New Balance: ${(deposit.user.balance + dailyReturnAmount).toLocaleString()} ETB`
          );
        }

        processedCount++;
        totalReturnsAmount += dailyReturnAmount;

        console.log(`✅ Processed daily return for ${deposit.user.fullName}: ${dailyReturnAmount.toLocaleString()} ETB`);

      } catch (error) {
        console.error(`❌ Error processing daily return for deposit ${deposit._id}:`, error);
        console.error('Error timestamp:', new Date().toISOString());
      }
    }

    console.log('=== DAILY RETURNS JOB COMPLETED ===');
    console.log(`Ethiopian Time: ${getEthiopianTime().format('YYYY-MM-DD HH:mm:ss [EAT]')}`);
    console.log(`UTC Time: ${new Date().toISOString()}`);
    console.log(`Processed: ${processedCount} returns`);
    console.log(`Total Returns: ${totalReturnsAmount.toLocaleString()} ETB`);
    console.log(`Total Commissions: ${totalCommissionsDistributed.toLocaleString()} ETB`);
    console.log('=====================================');

  } catch (error) {
    console.error('❌ Daily returns job error:', error);
    console.error('Error timestamp:', new Date().toISOString());
    console.error('Ethiopian Time:', getEthiopianTime().format('YYYY-MM-DD HH:mm:ss [EAT]'));
  }
}

async function processDailyReturnCommissions(deposit, returnAmount) {
  try {
    const user = await User.findById(deposit.user).populate('referredBy');
    if (!user || !user.referredBy) {
      console.log(`No referrer found for user ${user?.fullName || 'Unknown'}`);
      return 0;
    }

    let currentUser = user.referredBy;
    let level = 1;
    let totalCommissionsDistributed = 0;

    console.log(`Processing commissions for ${user.fullName}'s daily return of ${returnAmount.toLocaleString()} ETB`);

    while (currentUser && level <= 4) {
      // Calculate commission: 8%, 4%, 2%, 1% of daily return
      const commissionAmount = returnAmount * DAILY_COMMISSION_RATES[level - 1];
      
      console.log(`- Level ${level} commission to ${currentUser.fullName}: ${commissionAmount.toLocaleString()} ETB (${(DAILY_COMMISSION_RATES[level - 1] * 100)}%)`);

      // Create commission record
      const commission = new Commission({
        user: currentUser._id,
        fromUser: deposit.user,
        amount: commissionAmount,
        level,
        type: 'earning',
        description: `Level ${level} daily return commission (${(DAILY_COMMISSION_RATES[level - 1] * 100)}%) from ${user.fullName}`,
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

      totalCommissionsDistributed += commissionAmount;

      // Send notification
      if (currentUser.telegramChatId) {
        await telegramService.sendMessage(
          currentUser.telegramChatId,
          `💰 Daily Commission Earned!\n\n` +
          `Amount: ${commissionAmount.toLocaleString()} ETB\n` +
          `Level: ${level} (${(DAILY_COMMISSION_RATES[level - 1] * 100)}%)\n` +
          `From: ${user.fullName}'s daily return\n` +
          `Source: ${deposit.package}\n\n` +
          `Your balance has been updated!`
        );
      }

      // Move to next level
      const nextUser = await User.findById(currentUser._id).populate('referredBy');
      currentUser = nextUser?.referredBy;
      level++;
    }

    console.log(`Total commissions distributed: ${totalCommissionsDistributed.toLocaleString()} ETB`);
    return totalCommissionsDistributed;

  } catch (error) {
    console.error('Daily return commission processing error:', error);
    return 0;
  }
}

// Export for manual testing
module.exports = { 
  processDailyReturns,
  processDailyReturnCommissions,
  PACKAGE_CONFIG,
  DAILY_COMMISSION_RATES
};