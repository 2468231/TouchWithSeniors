/**
 * server/config/db.js
 *
 * Standard Mongoose connection with global caching.
 * Works for both Vercel serverless (reuses the connection across warm invocations)
 * and long-running servers like Render / Railway.
 *
 * Connection string: standard MongoDB Atlas SRV format
 *   mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<db>?retryWrites=true&w=majority
 */

const mongoose = require('mongoose');

// Global cache to reuse the connection across Vercel serverless invocations
let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

async function connectDB() {
  // Return existing connection immediately if available
  if (cached.conn) {
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      'MONGODB_URI is not set. Add it to your environment variables (.env locally, Vercel/Render dashboard in production).'
    );
  }

  // Only create a new connection promise if one is not already in progress
  if (!cached.promise) {
    console.log('[DB] Connecting to MongoDB Atlas...');

    const options = {
      // Keep Mongoose command buffering ON — queued operations wait for connection
      bufferCommands: true,

      // How long to try finding an available server before throwing
      serverSelectionTimeoutMS: 10000,

      // Timeout for initial TCP connection to a MongoDB server
      connectTimeoutMS: 10000,

      // Max time to wait for a response on an open socket
      socketTimeoutMS: 45000,

      // Connection pool — 10 simultaneous operations max (right-sized for serverless)
      maxPoolSize: 10,
    };

    cached.promise = mongoose
      .connect(uri, options)
      .then((m) => {
        console.log(`[DB] ✅ Connected — host: ${m.connection.host}`);
        return m.connection;
      })
      .catch((err) => {
        // Reset so the next request can retry
        cached.promise = null;
        console.error('[DB] ❌ Connection error:', err.message);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

/**
 * For long-running servers (Render, Railway, local dev):
 * Call this once at startup so the connection is warm before the first request.
 */
async function connectDBOnce() {
  try {
    await connectDB();
  } catch (err) {
    console.error('[DB] Fatal: could not connect to MongoDB on startup:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
module.exports.connectDBOnce = connectDBOnce;
module.exports.getState = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] ?? 'unknown';
};
