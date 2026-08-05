const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Query = require('../models/Query');
const Resource = require('../models/Resource');
const Opportunity = require('../models/Opportunity');
const InterviewExperience = require('../models/InterviewExperience');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

// All admin routes require auth + admin role
router.use(protect, authorize('admin'));

// @route   GET /api/admin/analytics
router.get('/analytics', async (req, res) => {
  try {
    const [totalUsers, totalQueries, totalResources, pendingResources, totalOpportunities, totalExperiences] = await Promise.all([
      User.countDocuments(),
      Query.countDocuments(),
      Resource.countDocuments({ approved: true }),
      Resource.countDocuments({ approved: false }),
      Opportunity.countDocuments({ isActive: true }),
      InterviewExperience.countDocuments()
    ]);
    
    // Users by college
    const collegeStats = await User.aggregate([
      { $group: { _id: '$college', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Recent users (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUsers = await User.countDocuments({ createdAt: { $gte: weekAgo } });
    
    res.json({
      totalUsers, totalQueries, totalResources, pendingResources,
      totalOpportunities, totalExperiences, collegeStats, recentUsers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await User.countDocuments(query);
    res.json({ users, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/admin/users/:id/role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/admin/resources/pending
router.get('/resources/pending', async (req, res) => {
  try {
    const resources = await Resource.find({ approved: false })
      .populate('addedBy', 'name email college');
    res.json({ resources });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/admin/resources/:id/approve
router.put('/resources/:id/approve', async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id, { approved: true }, { new: true }
    );
    res.json({ resource });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/admin/queries
router.get('/queries', async (req, res) => {
  try {
    const queries = await Query.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ queries });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   DELETE /api/admin/queries/:id
router.delete('/queries/:id', async (req, res) => {
  try {
    await Query.findByIdAndDelete(req.params.id);
    res.json({ message: 'Query deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
