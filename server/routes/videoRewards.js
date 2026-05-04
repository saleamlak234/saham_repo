const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const Video = require('../models/Video');
const VideoReward = require('../models/VideoReward');
const User = require('../models/User');

// Video upload storage
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/videos');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `video-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`);
  }
});

const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    const allowed = /mp4|webm|mov|avi|mkv/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = file.mimetype.startsWith('video/');
    if (ext && mime) return cb(null, true);
    cb(new Error('Only video files are allowed'));
  }
});

// GET /api/video-rewards/videos - Get all active videos for users
router.get('/videos', async (req, res) => {
  try {
    const videos = await Video.find({ isActive: true })
      .populate('uploadedBy', 'fullName')
      .sort({ createdAt: -1 });

    // For each video, check if user has already claimed today
    const today = new Date().toISOString().split('T')[0];
    const enriched = await Promise.all(videos.map(async (v) => {
      const reward = await VideoReward.findOne({
        userId: req.user._id,
        videoId: v._id,
        viewDate: today
      });
      return {
        ...v.toObject(),
        claimedToday: !!reward,
        todayViewCount: reward ? reward.viewCount : 0
      };
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/video-rewards/claim/:videoId - Claim reward for watching
router.post('/claim/:videoId', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.isDashboardLocked) {
      return res.status(403).json({ message: 'Dashboard locked. Pay your debt first.' });
    }

    const video = await Video.findById(req.params.videoId);
    if (!video || !video.isActive) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const today = new Date().toISOString().split('T')[0];
    let reward = await VideoReward.findOne({
      userId: req.user._id,
      videoId: video._id,
      viewDate: today
    });

    if (reward) {
      // Additional views today
      reward.viewCount += 1;
      reward.amount += video.rewardAmount;
      await reward.save();
    } else {
      // First view today
      reward = await VideoReward.create({
        userId: req.user._id,
        videoId: video._id,
        amount: video.rewardAmount,
        viewDate: today,
        viewCount: 1
      });
    }

    // Credit user balance
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { balance: video.rewardAmount }
    });

    // Update video stats
    await Video.findByIdAndUpdate(video._id, {
      $inc: { totalViews: 1 }
    });

    res.json({
      success: true,
      message: `Earned ${video.rewardAmount} birr!`,
      earned: video.rewardAmount,
      reward
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/video-rewards/today-earnings - Today's video earnings for user
router.get('/today-earnings', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const rewards = await VideoReward.find({
      userId: req.user._id,
      viewDate: today
    });
    const total = rewards.reduce((sum, r) => sum + r.amount, 0);
    const totalViews = rewards.reduce((sum, r) => sum + r.viewCount, 0);
    res.json({ total, totalViews, rewards });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Admin Only Routes ---

// POST /api/video-rewards/admin/upload - Admin uploads video
router.post('/admin/upload', async (req, res, next) => {
  if (!['admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}, videoUpload.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Video file required' });

    const { title, description, rewardAmount } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const video = await Video.create({
      title,
      description: description || '',
      videoUrl: `/uploads/videos/${req.file.filename}`,
      uploadedBy: req.user._id,
      rewardAmount: Number(rewardAmount) || 20
    });

    res.json({ success: true, message: 'Video uploaded', video });
  } catch (error) {
    if (req.file) {
      fs.unlink(path.join(__dirname, '../uploads/videos', req.file.filename), () => {});
    }
    res.status(500).json({ message: error.message });
  }
});

// GET /api/video-rewards/admin/all - Admin gets all videos with stats
router.get('/admin/all', async (req, res) => {
  try {
    if (!['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const videos = await Video.find()
      .populate('uploadedBy', 'fullName')
      .sort({ createdAt: -1 });

    const enriched = await Promise.all(videos.map(async (v) => {
      const today = new Date().toISOString().split('T')[0];
      const todayViewers = await VideoReward.distinct('userId', { videoId: v._id, viewDate: today });
      const allViewers = await VideoReward.distinct('userId', { videoId: v._id });
      const totalPaid = await VideoReward.aggregate([
        { $match: { videoId: v._id } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      return {
        ...v.toObject(),
        todayViewers: todayViewers.length,
        uniqueViewers: allViewers.length,
        totalRewardsPaid: totalPaid[0]?.total || 0
      };
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/video-rewards/admin/video-viewers/:videoId - Who watched today
router.get('/admin/video-viewers/:videoId', async (req, res) => {
  try {
    if (!['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const viewers = await VideoReward.find({ videoId: req.params.videoId, viewDate: targetDate })
      .populate('userId', 'fullName email phoneNumber');

    res.json(viewers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/video-rewards/admin/toggle/:videoId - Toggle video active state
router.put('/admin/toggle/:videoId', async (req, res) => {
  try {
    if (!['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const video = await Video.findById(req.params.videoId);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    video.isActive = !video.isActive;
    await video.save();

    res.json({ success: true, message: `Video ${video.isActive ? 'activated' : 'deactivated'}`, video });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
