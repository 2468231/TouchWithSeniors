const mongoose = require('mongoose');

let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

/**
 * connectDB — blocking await with short timeout.
 * 3 second serverSelectionTimeout ensures we get a real error message
 * back well within Vercel's 10s function limit, so we can diagnose
 * the exact failure reason (auth, network, DNS, etc.)
 */
async function connectDB() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri || uri === 'undefined') {
    throw new Error('MONGODB_URI environment variable is not set.');
  }

  if (!cached.promise) {
    console.log('[DB] Connecting to MongoDB Atlas...');
    console.log('[DB] URI host:', uri.split('@')[1]?.split('/')[0] || 'unknown');

    cached.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 7000,  // 7s — returns error well before Vercel 10s limit
        connectTimeoutMS: 7000,
        socketTimeoutMS: 30000,
        maxPoolSize: 5,
        family: 4,                        // Force IPv4 — avoids IPv6 routing issues
      })
      .then((m) => {
        console.log('[DB] ✅ Connected to:', m.connection.host);
        cached.conn = m.connection;
        return m.connection;
      })
      .catch((err) => {
        console.error('[DB] ❌ Connection failed:', err.name, '-', err.message);
        cached.promise = null; // reset for retry
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
module.exports.getState = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] || 'unknown';
};
