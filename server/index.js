// Local dev server — delegates to the same app as Vercel serverless
const app = require('./api/index');
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 TouchWithSeniors server → http://localhost:${PORT}`));
