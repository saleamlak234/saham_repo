const express = require('express');
const DailyReturn = require('../models/DailyReturn');
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

    // Calculate statistics
    const totalReturns = await DailyReturn.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const todayReturns = await DailyReturn.aggregate([
      { 
        $match: { 
          user: userId, 
          date: getEthiopianDateString() 
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      dailyReturns,
      totalReturns: totalReturns[0]?.total || 0,
      todayReturns: todayReturns[0]?.total || 0
    });
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
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalReturns: totalReturns[0]?.total || 0,
      todayReturns: todayReturns[0]?.total || 0,
      monthlyReturns: monthlyReturns[0]?.total || 0,
      returnsByPackage
    });
  } catch (error) {
    console.error('Get daily returns stats error:', error);
    res.status(500).json({ message: 'Server error fetching daily returns statistics' });
  }
});

module.exports = router;