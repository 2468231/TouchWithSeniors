const express = require('express');
const router = express.Router();
const InterviewExperience = require('../models/InterviewExperience');
const { protect, optionalProtect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

// @route   GET /api/experiences
router.get('/', optionalProtect, async (req, res) => {
  try {
    const { company, search, page = 1, limit = 10 } = req.query;
    const query = {};
    if (company) query.company = { $regex: company, $options: 'i' };
    if (search) query.$or = [
      { company: { $regex: search, $options: 'i' } },
      { role: { $regex: search, $options: 'i' } }
    ];
    const experiences = await InterviewExperience.find(query)
      .populate('author', 'name college department passoutYear profilePhoto')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await InterviewExperience.countDocuments(query);
    
    // Get top companies
    const topCompanies = await InterviewExperience.aggregate([
      { $group: { _id: '$company', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({ experiences, total, pages: Math.ceil(total / limit), topCompanies });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/experiences
router.post('/', protect, async (req, res) => {
  try {
    const exp = await InterviewExperience.create({ ...req.body, author: req.user._id });
    const populated = await InterviewExperience.findById(exp._id)
      .populate('author', 'name college department passoutYear profilePhoto');
    res.status(201).json({ experience: populated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/experiences/:id/upvote
router.put('/:id/upvote', protect, async (req, res) => {
  try {
    const exp = await InterviewExperience.findById(req.params.id);
    if (!exp) return res.status(404).json({ error: 'Not found' });
    const idx = exp.upvotes.indexOf(req.user._id);
    if (idx > -1) {
      exp.upvotes.splice(idx, 1);
    } else {
      exp.upvotes.push(req.user._id);
    }
    await exp.save();
    res.json({ upvotes: exp.upvotes.length, upvoted: idx === -1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   DELETE /api/experiences/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await InterviewExperience.findByIdAndDelete(req.params.id);
    res.json({ message: 'Experience deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
