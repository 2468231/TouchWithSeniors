const express = require('express');
const router = express.Router();
const Query = require('../models/Query');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { protect, optionalProtect } = require('../middleware/auth');

// @route   GET /api/queries
router.get('/', optionalProtect, async (req, res) => {
  try {
    const { tag, search, sort = 'newest', page = 1, limit = 10 } = req.query;
    const query = {};
    if (tag) query.tags = tag;
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
    const sortOption = sort === 'popular' ? { 'upvotes': -1 } : { createdAt: -1 };
    const queries = await Query.find(query)
      .populate('author', 'name college department passoutYear profilePhoto')
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await Query.countDocuments(query);
    res.json({ queries, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/queries
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const query = await Query.create({ title, description, tags, author: req.user._id });
    await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.queriesPosted': 1 } });
    const populated = await Query.findById(query._id)
      .populate('author', 'name college department passoutYear profilePhoto');
    res.status(201).json({ query: populated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/queries/:id
router.get('/:id', async (req, res) => {
  try {
    const query = await Query.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'name college department passoutYear profilePhoto');
    if (!query) return res.status(404).json({ error: 'Query not found' });
    const comments = await Comment.find({ query: req.params.id, parentComment: null })
      .populate('author', 'name profilePhoto')
      .sort({ createdAt: -1 });
    const replies = await Comment.find({ query: req.params.id, parentComment: { $ne: null } })
      .populate('author', 'name profilePhoto')
      .sort({ createdAt: 1 });
    res.json({ query, comments, replies });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/queries/:id/upvote
router.put('/:id/upvote', protect, async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);
    if (!query) return res.status(404).json({ error: 'Query not found' });
    const idx = query.upvotes.indexOf(req.user._id);
    if (idx > -1) {
      query.upvotes.splice(idx, 1);
    } else {
      query.upvotes.push(req.user._id);
    }
    await query.save();
    res.json({ upvotes: query.upvotes.length, upvoted: idx === -1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/queries/:id/dislike
router.put('/:id/dislike', protect, async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);
    if (!query) return res.status(404).json({ error: 'Query not found' });
    const idx = query.dislikes.indexOf(req.user._id);
    if (idx > -1) {
      query.dislikes.splice(idx, 1);
    } else {
      query.dislikes.push(req.user._id);
      // Remove upvote if user downvotes
      const upIdx = query.upvotes.indexOf(req.user._id);
      if (upIdx > -1) query.upvotes.splice(upIdx, 1);
    }
    await query.save();
    res.json({ dislikes: query.dislikes.length, disliked: idx === -1, upvotes: query.upvotes.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/queries/:id/comments
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const { content, parentComment } = req.body;
    const comment = await Comment.create({
      content, author: req.user._id, query: req.params.id,
      parentComment: parentComment || null
    });
    const populated = await Comment.findById(comment._id)
      .populate('author', 'name profilePhoto college');
    res.status(201).json({ comment: populated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   DELETE /api/queries/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);
    if (!query) return res.status(404).json({ error: 'Not found' });
    if (query.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await Query.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ query: req.params.id });
    res.json({ message: 'Query deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
