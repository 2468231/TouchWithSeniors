/**
 * server/api/index.js
 * ─────────────────────────────────────────────────────────────────────────
 * Vercel serverless entry point.  This file is what vercel.json points at.
 * It is also re-used by server/index.js for local development.
 *
 * Rules for Vercel serverless compatibility:
 *   1. Do NOT call app.listen() here — Vercel handles the HTTP server.
 *   2. Do NOT call connectDB() at module level — env vars are injected by
 *      Vercel at request time, not at cold-start import time.
 *   3. Connect inside a middleware so DB is ready before any route runs.
 *   4. Do NOT load dotenv in production — Vercel injects env vars natively.
 */

// ── Load environment variables (LOCAL ONLY) ─────────────────────────────
// Vercel sets env vars through its dashboard — dotenv is only for local dev.
if (process.env.NODE_ENV !== 'production') {
  const path = require('path');
  // Explicit path to server/.env so this works no matter where you run it from.
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
// Allow:  local dev ports  +  any *.vercel.app subdomain  +  CLIENT_URL env
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow server-to-server / Postman
    const whitelist = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.CLIENT_URL,
    ].filter(Boolean);
    const isAllowed =
      whitelist.includes(origin) ||
      /\.vercel\.app$/.test(origin);
    callback(null, isAllowed ? true : true); // permissive — tighten CLIENT_URL in prod
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

// ── Health check (BEFORE db middleware — always responds) ───────────────
// This lets you verify env vars are available even if DB is down.
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

// ── Database middleware ───────────────────────────────────────────────────
// Connect LAZILY on first request.  This is the CORRECT pattern for Vercel:
//   - module-level init may run before Vercel injects env vars on cold start
//   - per-request middleware runs AFTER env vars are guaranteed available
//   - cached connection is reused on warm invocations (no overhead)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB middleware error:', err.message);
    return res.status(500).json({
      error:  'Database connection failed',
      detail: err.message,
      tip:    'Ensure MONGODB_URI is set in Vercel → Project → Settings → Environment Variables',
    });
  }
});

// ── API routes ────────────────────────────────────────────────────────────
app.use('/api/auth',            require('../routes/auth'));
app.use('/api/users',           require('../routes/users'));
app.use('/api/queries',         require('../routes/queries'));
app.use('/api/resources',       require('../routes/resources'));
app.use('/api/opportunities',   require('../routes/opportunities'));
app.use('/api/experiences',     require('../routes/experiences'));
app.use('/api/admin',           require('../routes/admin'));
app.use('/api/mentor-sessions', require('../routes/mentorSessions'));
app.use('/api/products',        require('../routes/products'));

// ── Health check ─────────────────────────────────────────────────────────
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

// ── Export app for Vercel (do NOT call app.listen here) ──────────────────
module.exports = app;
