const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { fullName, phoneNumber } = req.body;
    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      { fullName, phoneNumber },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Link Telegram account
router.post('/link-telegram', async (req, res) => {
  try {
    const { telegramChatId } = req.body;
    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      { telegramChatId },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Telegram account linked successfully',
      user
    });
  } catch (error) {
    console.error('Link Telegram error:', error);
    res.status(500).json({ message: 'Server error linking Telegram account' });
  }
});

module.exports = router;