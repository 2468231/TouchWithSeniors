const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   PUT /api/users/onboarding
router.put('/onboarding', protect, async (req, res) => {
  try {
    const { college, department, passoutYear, name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { college, department, passoutYear, name, onboardingComplete: true },
      { new: true }
    );
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        department: user.department,
        passoutYear: user.passoutYear,
        profilePhoto: user.profilePhoto,
        onboardingComplete: user.onboardingComplete,
        academicYear: user.academicYear
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, bio, profilePhoto } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, profilePhoto },
      { new: true }
    );
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/users/:id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/users/bookmark/:oppId
router.post('/bookmark/:oppId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const oppId = req.params.oppId;
    const idx = user.bookmarkedOpportunities.indexOf(oppId);
    if (idx > -1) {
      user.bookmarkedOpportunities.splice(idx, 1);
    } else {
      user.bookmarkedOpportunities.push(oppId);
    }
    await user.save();
    res.json({ bookmarked: idx === -1, bookmarks: user.bookmarkedOpportunities });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
