const mongoose = require('mongoose');

// Cache the connection across warm serverless invocations.
// On Vercel, a warm function container reuses the same process —
// this prevents opening a new DB connection on every API request.
let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

async function connectDB() {
  // Return cached connection instantly
  if (cached.conn) return cached.conn;

  // Validate URI before trying to connect
  const uri = process.env.MONGODB_URI;
  if (!uri || uri === 'undefined') {
    throw new Error(
      '[TouchWithSeniors] MONGODB_URI environment variable is missing or undefined.\n' +
      'LOCAL: set it in server/.env\n' +
      'VERCEL: set it in Project → Settings → Environment Variables'
    );
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        bufferCommands: false,          // fail fast instead of queuing when disconnected
        serverSelectionTimeoutMS: 8000, // 8s — within Vercel Hobby 10s function limit
        connectTimeoutMS: 8000,         // also cap initial TCP connect
        socketTimeoutMS: 45000,
        maxPoolSize: 10,               // keep up to 10 connections in pool
        minPoolSize: 1,                // always keep 1 connection alive
      })
      .then((m) => {
        console.log(`✅ MongoDB connected: ${m.connection.host}`);
        return m;
      })
      .catch((err) => {
        cached.promise = null; // reset so the next request retries
        console.error('❌ MongoDB connection failed:', err.message);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
