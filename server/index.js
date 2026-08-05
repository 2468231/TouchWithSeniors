/**
 * Local development server only.
 * Vercel uses server/api/index.js directly — this file is NOT used on Vercel.
 */

// Load .env for local development
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = require('./api/index');
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 TouchWithSeniors server → http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 MONGODB_URI set: ${!!process.env.MONGODB_URI}`);
});
