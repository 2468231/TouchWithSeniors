const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { getCollegeFromEmail, extractYearFromEmail, yearToPassout, COLLEGES } = require('../config/colleges');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'tws_secret_2024', { expiresIn: '90d' });

// GET /api/auth/colleges
router.get('/colleges', (req, res) => {
  res.json({ colleges: COLLEGES });
});

// POST /api/auth/register  — College + Email + Name only, no password/OTP
router.post('/register', async (req, res) => {
  try {
    const { name, email, college } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const emailLower = email.toLowerCase().trim();

    // Validate college email domain
    const collegeInfo = getCollegeFromEmail(emailLower);
    if (!collegeInfo) {
      return res.status(400).json({
        error: 'Please use your official college email (e.g. name.cs24@rvce.edu.in)',
      });
    }

    // Check duplicate
    const existing = await User.findOne({ email: emailLower });
    if (existing) {
      // Email already exists — just log them in
      const token = generateToken(existing._id);
      return res.json({
        token,
        user: {
          id: existing._id, name: existing.name, email: existing.email,
          role: existing.role, college: existing.college,
          department: existing.department, passoutYear: existing.passoutYear,
          onboardingComplete: existing.onboardingComplete,
          academicYear: existing.academicYear, stats: existing.stats
        }
      });
    }

    // Auto-detect passout year from email
    const yr2 = extractYearFromEmail(emailLower);
    const passoutYear = yr2 ? yearToPassout(yr2) : null;

    const user = await User.create({
      name: name.trim(),
      email: emailLower,
      password: undefined,
      college: college || collegeInfo.name,
      passoutYear,
      onboardingComplete: true
    });

    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: {
        id: user._id, name: user.name, email: user.email, role: user.role,
        college: user.college, department: user.department, passoutYear: user.passoutYear,
        onboardingComplete: user.onboardingComplete, academicYear: user.academicYear, stats: user.stats
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Email already registered.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login  — Email only, no password
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        error: 'No account found. Please register first.',
        notFound: true
      });
    }

    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        id: user._id, name: user.name, email: user.email, role: user.role,
        college: user.college, department: user.department, passoutYear: user.passoutYear,
        onboardingComplete: user.onboardingComplete, academicYear: user.academicYear, stats: user.stats
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      user: {
        id: user._id, name: user.name, email: user.email, role: user.role,
        college: user.college, department: user.department, passoutYear: user.passoutYear,
        onboardingComplete: user.onboardingComplete, academicYear: user.academicYear,
        stats: user.stats, bio: user.bio
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
