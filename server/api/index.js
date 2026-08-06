/**
 * server/api/index.js — Vercel Serverless Entry Point
 */
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

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowed = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.CLIENT_URL,
    ].filter(Boolean);
    const ok = allowed.includes(origin) || /\.vercel\.app$/.test(origin);
    callback(null, ok || true);
  },
  credentials: true,
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ── Health check (no DB needed) ───────────────────────────────────────────
const mongoose = require('mongoose');
app.get('/api/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
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

// ── Colleges (no DB needed) ───────────────────────────────────────────────
const { COLLEGES } = require('../config/colleges');
app.get('/api/auth/colleges', (req, res) => {
  res.json({ colleges: COLLEGES });
});

// ── DB connection middleware (blocking, 7s timeout) ───────────────────────
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[Middleware] DB error:', err.message);
    return res.status(503).json({
      error:  'Database connection failed',
      detail: err.message,
      code:   err.code || err.name || 'UNKNOWN',
      tip:    'Check Atlas cluster status and MONGODB_URI env var',
    });
  }
});

// ── Routes ────────────────────────────────────────────────────────────────
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

// ── Error handler ─────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;
