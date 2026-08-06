/**
 * server/api/index.js — Vercel Serverless Entry Point
 *
 * KEY DESIGN: Non-blocking MongoDB connection
 *   - connectDB() is called ONCE at module load (fire-and-forget)
 *   - Mongoose buffers all DB operations until the connection is ready
 *   - No blocking 'await' in request middleware → no Vercel 10s timeout
 *   - bufferTimeoutMS:8000 means if Atlas never connects, operations fail after 8s
 */

// ── Load environment variables (LOCAL ONLY) ──────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  const path = require('path');
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
}

const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('../config/db');

// ── Fire DB connection immediately at module load ─────────────────────────
// This is NON-BLOCKING. Mongoose buffers operations until connected.
// On warm Vercel invocations the cached connection is reused instantly.
connectDB();

const app = express();

// ── Security headers ──────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));

// ── CORS ──────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowed = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.CLIENT_URL,
    ].filter(Boolean);
    const ok = allowed.includes(origin) || /\.vercel\.app$/.test(origin);
    callback(null, ok || true); // permissive for now
  },
  credentials: true,
}));

// ── Rate limiting ─────────────────────────────────────────────────────────
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
}));

// ── Body parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── HTTP logging (dev only) ───────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ── Health check (always responds, no DB needed) ──────────────────────────
const { isConnected } = require('../config/db');
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const states   = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    status:       'ok',
    env:          process.env.NODE_ENV || 'development',
    mongoUriSet:  !!process.env.MONGODB_URI,
    jwtSecretSet: !!process.env.JWT_SECRET,
    dbStatus:     states[mongoose.connection.readyState] || 'unknown',
    timestamp:    new Date().toISOString(),
    node:         process.version,
  });
});

// ── Colleges (no DB needed — reads from config file) ──────────────────────
const { COLLEGES } = require('../config/colleges');
app.get('/api/auth/colleges', (req, res) => {
  res.json({ colleges: COLLEGES });
});

// ── All other API routes (DB required via Mongoose buffering) ─────────────
app.use('/api/auth',            require('../routes/auth'));
app.use('/api/users',           require('../routes/users'));
app.use('/api/queries',         require('../routes/queries'));
app.use('/api/resources',       require('../routes/resources'));
app.use('/api/opportunities',   require('../routes/opportunities'));
app.use('/api/experiences',     require('../routes/experiences'));
app.use('/api/admin',           require('../routes/admin'));
app.use('/api/mentor-sessions', require('../routes/mentorSessions'));
app.use('/api/products',        require('../routes/products'));

// ── 404 ───────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ── Global error handler ──────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  const status = err.status || 500;
  const msg    = err.message || 'Internal Server Error';

  // Friendly messages for common Mongoose errors
  if (msg.includes('buffering timed out') || msg.includes('Cannot read properties')) {
    return res.status(503).json({
      error:  'Database not ready',
      detail: 'MongoDB Atlas connection is still initialising. Retry in a few seconds.',
      tip:    'If this persists, check that your Atlas cluster is not paused.',
    });
  }

  res.status(status).json({ error: msg });
});

// ── Export for Vercel ─────────────────────────────────────────────────────
module.exports = app;
