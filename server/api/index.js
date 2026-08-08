/**
 * server/api/index.js
 *
 * ─────────────────────────────────────────────────────────────
 *  Vercel → this file is the serverless entry point
 *  Render / Local → server/index.js imports this app and listens
 * ─────────────────────────────────────────────────────────────
 */

// Load .env in local dev / non-Vercel environments
if (process.env.NODE_ENV !== 'production') {
  const path = require('path');
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
}

const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose  = require('mongoose');
const connectDB = require('../config/db');

const app = express();

// ── Security & Middleware ─────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server calls (no origin header)
    if (!origin) return callback(null, true);
    const allowed = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.CLIENT_URL,           // e.g. https://touchwithseniors.vercel.app
    ].filter(Boolean);
    const ok =
      allowed.includes(origin) ||
      /\.vercel\.app$/.test(origin) ||  // all *.vercel.app preview deployments
      /\.onrender\.com$/.test(origin);  // allow Render services to call each other
    callback(null, !!ok);
  },
  credentials: true,
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ── Health check (no DB required) ────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    status:       'ok',
    env:          process.env.NODE_ENV || 'development',
    mongoUriSet:  !!process.env.MONGODB_URI,
    jwtSecretSet: !!process.env.JWT_SECRET,
    dbStatus:     states[mongoose.connection.readyState] ?? 'unknown',
    timestamp:    new Date().toISOString(),
    node:         process.version,
  });
});

// ── Colleges list (no DB required, static data) ──────────────────────────
const { COLLEGES } = require('../config/colleges');
app.get('/api/auth/colleges', (_req, res) => {
  res.json({ colleges: COLLEGES });
});

// ── One-time admin setup route ────────────────────────────────────────────
// Usage: GET /api/make-admin?email=YOUR_EMAIL&secret=TWS_ADMIN_2024
// Protected by secret key — safe to keep in production
app.get('/api/make-admin', async (req, res) => {
  const { email, secret } = req.query;
  const ADMIN_SECRET = process.env.ADMIN_SECRET || 'TWS_ADMIN_2024';

  if (!secret || secret !== ADMIN_SECRET) {
    return res.status(403).json({ error: 'Invalid secret key' });
  }
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const User = require('../models/User');
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { role: 'admin' },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found. Register first then call this route.' });
    res.json({ success: true, message: `✅ ${user.name} (${user.email}) is now ADMIN. Login again to see the Admin panel.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ── Database connection middleware ────────────────────────────────────────
// For Vercel: awaits the cached connection on every cold-start invocation.
// For Render/Railway: the connection is already open (connectDBOnce at startup),
// so this resolves instantly from the cache.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[DB Middleware]', err.message);
    return res.status(503).json({
      error:   'Database temporarily unavailable',
      message: err.message,
      tip:     'Ensure MONGODB_URI is set and your Atlas cluster IP whitelist includes 0.0.0.0/0',
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

// ── 404 ───────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ── Global error handler ──────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;
