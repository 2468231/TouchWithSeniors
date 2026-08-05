const express = require('express');
const router = express.Router();
const Opportunity = require('../models/Opportunity');
const { protect, optionalProtect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

// @route   GET /api/opportunities
router.get('/', optionalProtect, async (req, res) => {
  try {
    const { type, tag, search, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };
    if (type) query.type = type;
    if (tag) query.tags = tag;
    if (search) query.$or = [
      { company: { $regex: search, $options: 'i' } },
      { role: { $regex: search, $options: 'i' } }
    ];
    const opportunities = await Opportunity.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await Opportunity.countDocuments(query);
    
    let bookmarks = [];
    if (req.user) {
      const User = require('../models/User');
      const user = await User.findById(req.user._id);
      bookmarks = user.bookmarkedOpportunities.map(id => id.toString());
    }
    
    res.json({ opportunities, total, pages: Math.ceil(total / limit), bookmarks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/opportunities
router.post('/', protect, authorize('admin', 'senior'), async (req, res) => {
  try {
    const opp = await Opportunity.create({ ...req.body, postedBy: req.user._id });
    res.status(201).json({ opportunity: opp });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   DELETE /api/opportunities/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Opportunity.findByIdAndDelete(req.params.id);
    res.json({ message: 'Opportunity deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
