const mongoose = require('mongoose');

// Cache the connection across serverless invocations (Vercel reuses warm functions)
let cached = global._mongooseConn;
if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

async function connectDB() {
  // Return existing connection immediately if available
  if (cached.conn) {
    return cached.conn;
  }

  // Validate the URI before attempting connection
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error(
      'MONGODB_URI is not defined. ' +
      'On Vercel: add it in Project → Settings → Environment Variables. ' +
      'Locally: add it to server/.env'
    );
  }

  // Only create the promise once (prevent multiple simultaneous connection attempts)
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,          // Don't buffer commands when disconnected
      serverSelectionTimeoutMS: 10000, // Give Atlas 10s to respond
      socketTimeoutMS: 45000,
    };
    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => {
        console.log(`✅ MongoDB Connected: ${m.connection.host}`);
        return m;
      })
      .catch((err) => {
        cached.promise = null; // Reset so next request retries
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
