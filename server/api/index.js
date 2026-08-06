/**
 * server/api/index.js — Vercel Serverless Entry Point
 * Rules:
 *   1. Do NOT call app.listen() — Vercel handles HTTP server
 *   2. Load dotenv only in development — Vercel injects env vars natively
 *   3. Pre-warm DB connection at module load so first request isn't slow
 *   4. Also use per-request middleware as safety net
 */

// ── Load environment variables (LOCAL ONLY) ─────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  const path = require('path');
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
}

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const rateLimit    = require('express-rate-limit');
const connectDB    = require('../config/db');

const app = express();

// ── Security headers ─────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));

// ── CORS ─────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const whitelist = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.CLIENT_URL,
    ].filter(Boolean);
    const isAllowed = whitelist.includes(origin) || /\.vercel\.app$/.test(origin);
    callback(null, isAllowed || true); // permissive — tighten later
  },
  credentials: true,
}));

// ── Rate limiting ─────────────────────────────────────────────────────────
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false }));

// ── Body parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── HTTP request logging (dev only) ──────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ── Health check (BEFORE db middleware) ──────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status:       'ok',
    env:          process.env.NODE_ENV || 'development',
    mongoUriSet:  !!process.env.MONGODB_URI,
    jwtSecretSet: !!process.env.JWT_SECRET,
    timestamp:    new Date().toISOString(),
    node:         process.version,
  });
});

// ── Colleges (no DB needed — reads from config) ───────────────────────────
const { COLLEGES } = require('../config/colleges');
app.get('/api/auth/colleges', (req, res) => {
  res.json({ colleges: COLLEGES });
});

// ── DB Connection middleware ──────────────────────────────────────────────
// All routes below this point require a DB connection.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB middleware error:', err.message);
    return res.status(500).json({
      error:  'Database connection failed',
      detail: err.message,
      tip:    'Check MONGODB_URI in Vercel project settings. Ensure Atlas cluster is not paused.',
    });
  }
});

// ── API Routes ────────────────────────────────────────────────────────────
app.use('/api/auth',            require('../routes/auth'));
app.use('/api/users',           require('../routes/users'));
app.use('/api/queries',         require('../routes/queries'));
app.use('/api/resources',       require('../routes/resources'));
app.use('/api/opportunities',   require('../routes/opportunities'));
app.use('/api/experiences',     require('../routes/experiences'));
app.use('/api/admin',           require('../routes/admin'));
app.use('/api/mentor-sessions', require('../routes/mentorSessions'));
app.use('/api/products',        require('../routes/products'));

// ── 404 handler ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ── Global error handler ──────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// ── Pre-warm DB at module load ────────────────────────────────────────────
// Start connecting IMMEDIATELY when Vercel loads this module (cold start).
// By the time the first request arrives, the connection is already in progress.
// This is safe because env vars ARE available at module load on Vercel.
if (process.env.MONGODB_URI) {
  connectDB().catch(err => {
    console.error('Pre-warm DB connection failed:', err.message);
  });
}

// ── Export for Vercel ─────────────────────────────────────────────────────
module.exports = app;
