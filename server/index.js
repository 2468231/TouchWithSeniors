require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, message: { error: 'Too many requests.' } });
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/queries', require('./routes/queries'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/opportunities', require('./routes/opportunities'));
app.use('/api/experiences', require('./routes/experiences'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/mentor-sessions', require('./routes/mentorSessions'));
app.use('/api/products', require('./routes/products'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date(), uptime: process.uptime() }));
app.use('*', (req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 TouchWithSeniors server → http://localhost:${PORT}`));
