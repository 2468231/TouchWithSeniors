/**
 * Vercel Serverless Entry Point  ← used by Vercel
 * Also used by server/index.js for local dev
 *
 * KEY RULE for Vercel serverless:
 *  - Do NOT call connectDB() at module level (runs at cold-start before env vars load on some runtimes)
 *  - Connect LAZILY inside a middleware so it runs per-request, when env vars are guaranteed available
 *  - Do NOT call app.listen() here — Vercel handles that
 *  - Do NOT use dotenv in production — Vercel injects env vars directly into process.env
 */

// Load .env ONLY for local development (Vercel ignores this — it has its own env injection)
if (process.env.NODE_ENV !== 'production') {
  const path = require('path');
  // Explicitly point to server/.env so the path works regardless of CWD
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('../config/db');

const app = express();

// ── Security middleware ─────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));

// ── CORS — allow Vercel frontend + localhost ────────────
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    const allowed = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.CLIENT_URL,
    ].filter(Boolean);
    // Also allow any *.vercel.app domain
    if (allowed.includes(origin) || /\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    callback(null, true); // Permissive during development — tighten CLIENT_URL in prod
  },
  credentials: true,
}));

// ── Rate limiting ───────────────────────────────────────
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
app.use(limiter);

// ── Body parsing ────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request logging (dev only, skip on Vercel to save cold-start time) ──
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ── DB Connection middleware ────────────────────────────
// Connect lazily on first request — this is the correct serverless pattern.
// Vercel guarantees process.env is populated before any request handler runs.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('❌ DB connection error:', err.message);
    return res.status(500).json({
      error: 'Database connection failed',
      detail: err.message,
      hint: 'Ensure MONGODB_URI is set in Vercel → Project → Settings → Environment Variables',
    });
  }
});

// ── API Routes ──────────────────────────────────────────
app.use('/api/auth',           require('../routes/auth'));
app.use('/api/users',          require('../routes/users'));
app.use('/api/queries',        require('../routes/queries'));
app.use('/api/resources',      require('../routes/resources'));
app.use('/api/opportunities',  require('../routes/opportunities'));
app.use('/api/experiences',    require('../routes/experiences'));
app.use('/api/admin',          require('../routes/admin'));
app.use('/api/mentor-sessions',require('../routes/mentorSessions'));
app.use('/api/products',       require('../routes/products'));

// ── Health check ────────────────────────────────────────
app.get('/api/health', (req, res) =>
  res.json({
    status: 'ok',
    env: process.env.NODE_ENV || 'development',
    mongoUriSet: !!process.env.MONGODB_URI,
    timestamp: new Date().toISOString(),
  })
);

// ── 404 handler ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ── Global error handler ────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// ── Export for Vercel (do NOT call app.listen here) ─────
module.exports = app;
