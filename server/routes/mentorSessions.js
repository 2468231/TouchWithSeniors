const express = require('express');
const router = express.Router();
const MentorSession = require('../models/MentorSession');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

// GET all approved sessions (public) + pending (admin)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;
    else query.status = 'approved'; // default show only approved

    const sessions = await MentorSession.find(query)
      .populate('submittedBy', 'name college department')
      .sort({ createdAt: -1 });
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all (admin)
router.get('/all', protect, authorize('admin'), async (req, res) => {
  try {
    const sessions = await MentorSession.find()
      .populate('submittedBy', 'name college email')
      .sort({ createdAt: -1 });
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Senior submits a session request
router.post('/', protect, async (req, res) => {
  try {
    const { seniorName, contact, expertise, preferredDate, preferredTime, description } = req.body;
    const session = await MentorSession.create({
      seniorName, contact, expertise, preferredDate, preferredTime, description,
      submittedBy: req.user._id
    });
    const populated = await MentorSession.findById(session._id)
      .populate('submittedBy', 'name college department');
    res.status(201).json({ session: populated, message: 'Session request submitted! Admin will review and create the Google Meet link.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - Admin approves and adds Google Meet link
router.put('/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const { googleMeetLink, confirmedDate, confirmedTime, adminNote } = req.body;
    const session = await MentorSession.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', googleMeetLink, confirmedDate, confirmedTime, adminNote },
      { new: true }
    ).populate('submittedBy', 'name college');
    res.json({ session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - Admin rejects
router.put('/:id/reject', protect, authorize('admin'), async (req, res) => {
  try {
    const { adminNote } = req.body;
    const session = await MentorSession.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', adminNote },
      { new: true }
    );
    res.json({ session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await MentorSession.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
