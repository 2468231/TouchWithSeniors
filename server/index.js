/**
 * server/index.js
 *
 * Entry point for:
 *   - Local development  →  node index.js  /  npm run dev
 *   - Render             →  Start command: node index.js
 *
 * Vercel does NOT use this file — it uses server/api/index.js directly.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { connectDBOnce } = require('./config/db');
const app  = require('./api/index');
const PORT = process.env.PORT || 5000;

// Connect to MongoDB first, then start listening
connectDBOnce().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running at http://localhost:${PORT}`);
    console.log(`   NODE_ENV    : ${process.env.NODE_ENV || 'development'}`);
    console.log(`   MONGODB_URI : ${process.env.MONGODB_URI ? '✅ set' : '❌ NOT SET'}`);
    console.log(`   JWT_SECRET  : ${process.env.JWT_SECRET  ? '✅ set' : '❌ NOT SET'}\n`);
  });
});
