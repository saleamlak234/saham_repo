const express = require('express');
const DailyReturn = require('../models/DailyReturn');
const Deposit = require('../models/Deposit');
const Commission = require('../models/Commission');
const { getEthiopianDateString } = require('../utils/timeUtils');

const router = express.Router();

// Get user's daily returns
router.get('/', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const userId = req.user._id;

    let dateFilter = {};
    const now = new Date();

    switch (period) {
      case 'today':
        dateFilter = { date: getEthiopianDateString() };
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = {
          date: {
            $gte: getEthiopianDateString(weekAgo),
            $lte: getEthiopianDateString()
          }
        };
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = {
          date: {
            $gte: getEthiopianDateString(monthAgo),
            $lte: getEthiopianDateString()
          }
        };
        break;
    }

    const dailyReturns = await DailyReturn.find({
      user: userId,
      ...dateFilter
    })
    .populate('deposit', 'package amount')
    .sort({ date: -1 });

    res.json({ dailyReturns });
  } catch (error) {
    console.error('Get daily returns error:', error);
    res.status(500).json({ message: 'Server error fetching daily returns' });
  }
});

// Get daily returns statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;

    // Total daily returns earned
    const totalReturns = await DailyReturn.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Today's returns
    const todayReturns = await DailyReturn.aggregate([
      { 
        $match: { 
          user: userId, 
          date: getEthiopianDateString() 
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // This month's returns
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const monthStart = getEthiopianDateString(new Date(currentYear, currentMonth - 1, 1));
    const monthEnd = getEthiopianDateString(new Date(currentYear, currentMonth, 0));

    const monthlyReturns = await DailyReturn.aggregate([
      { 
        $match: { 
          user: userId,
          date: { $gte: monthStart, $lte: monthEnd }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Returns by package
    const returnsByPackage = await DailyReturn.aggregate([
      { $match: { user: userId } },
      {
        $lookup: {
          from: 'deposits',
          localField: 'deposit',
          foreignField: '_id',
          as: 'depositInfo'
        }
      },
      { $unwind: '$depositInfo' },
      {
        $group: {
          _id: '$depositInfo.package',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          averageDaily: { $avg: '$amount' }
        }
      }
    ]);

    // Commission earnings from daily returns
    const dailyReturnCommissions = await Commission.aggregate([
      { 
        $match: { 
          user: userId, 
          type: 'earning',
          sourceModel: 'DailyReturn'
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      totalReturns: totalReturns[0]?.total || 0,
      todayReturns: todayReturns[0]?.total || 0,
      monthlyReturns: monthlyReturns[0]?.total || 0,
      returnsByPackage,
      dailyReturnCommissions: dailyReturnCommissions[0]?.total || 0
    });
  } catch (error) {
    console.error('Get daily returns stats error:', error);
    res.status(500).json({ message: 'Server error fetching daily returns statistics' });
  }
});

// Get commission breakdown for daily returns
router.get('/commissions', async (req, res) => {
  try {
    const userId = req.user._id;

    // Get commissions earned from daily returns by level
    const commissionsByLevel = await Commission.aggregate([
      { 
        $match: { 
          user: userId, 
          type: 'earning',
          sourceModel: 'DailyReturn'
        } 
      },
      {
        $group: {
          _id: '$level',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get recent daily return commissions
    const recentCommissions = await Commission.find({
      user: userId,
      type: 'earning',
      sourceModel: 'DailyReturn'
    })
    .populate('fromUser', 'fullName email')
    .sort({ createdAt: -1 })
    .limit(20);

    res.json({
      commissionsByLevel,
      recentCommissions
    });
  } catch (error) {
    console.error('Get daily return commissions error:', error);
    res.status(500).json({ message: 'Server error fetching commission data' });
  }
});

module.exports = router;