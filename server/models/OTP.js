const mongoose = require('mongoose');
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true },
  otp: { type: String, required: true },
  college: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now, expires: 600 }
});
module.exports = mongoose.model('OTP', otpSchema);
