require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('../config/db');

const app = express();
connectDB();

// CORS — allow any Vercel frontend + localhost
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  /https:\/\/.*\.vercel\.app$/,
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser requests
    const allowed = allowedOrigins.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    if (allowed || process.env.CLIENT_URL === origin) {
      callback(null, true);
    } else {
      callback(null, true); // permissive for now — tighten in production
    }
  },
  credentials: true
}));

app.use(helmet({ crossOriginResourcePolicy: false }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('../routes/auth'));
app.use('/api/users', require('../routes/users'));
app.use('/api/queries', require('../routes/queries'));
app.use('/api/resources', require('../routes/resources'));
app.use('/api/opportunities', require('../routes/opportunities'));
app.use('/api/experiences', require('../routes/experiences'));
app.use('/api/admin', require('../routes/admin'));
app.use('/api/mentor-sessions', require('../routes/mentorSessions'));
app.use('/api/products', require('../routes/products'));

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', env: process.env.NODE_ENV, timestamp: new Date() })
);

app.use('*', (req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Export for Vercel serverless (don't call app.listen here)
module.exports = app;

// For local dev only
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server → http://localhost:${PORT}`));
}
