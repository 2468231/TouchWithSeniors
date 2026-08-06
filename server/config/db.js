const mongoose = require('mongoose');

// ── Connection Cache (survives warm serverless invocations) ───────────────
let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, connecting: false };
}

/**
 * connectDB — non-blocking fire-and-forget.
 * We start the connection at module load and let Mongoose buffer operations.
 * This is the correct pattern for Vercel Hobby (10s function limit):
 *   - We do NOT await in the request middleware
 *   - Mongoose's internal buffer (bufferTimeoutMS: 8000) queues operations
 *   - Once the connection is established, buffered operations auto-execute
 *   - If connection fails within 8s, operations throw MongooseError
 */
function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri === 'undefined') {
    console.error('[TouchWithSeniors] MONGODB_URI is not set!');
    return; // silently fail — health check will show mongoUriSet: false
  }

  // Already connected or connecting — don't create a second connection
  if (cached.conn || cached.connecting) return;

  cached.connecting = true;

  // Configure mongoose BEFORE connect()
  mongoose.set('bufferTimeoutMS', 8000); // operations buffer for up to 8s

  mongoose
    .connect(uri, {
      bufferCommands: true,              // ENABLE buffering — operations wait for connection
      serverSelectionTimeoutMS: 20000,   // give Atlas 20s to respond
      connectTimeoutMS: 20000,
      socketTimeoutMS: 45000,
      maxPoolSize: 5,                    // M0 free tier connection limit is 500
      minPoolSize: 1,
    })
    .then((m) => {
      cached.conn = m.connection;
      cached.connecting = false;
      console.log(`✅ MongoDB Atlas connected: ${m.connection.host}`);
    })
    .catch((err) => {
      cached.connecting = false;
      cached.conn = null;
      console.error('❌ MongoDB connection error:', err.message);
      // Will retry on next module load (cold start) or if reconnect logic kicks in
    });
}

module.exports = connectDB;
module.exports.isConnected = () => mongoose.connection.readyState === 1;
