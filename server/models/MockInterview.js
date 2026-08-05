const mongoose = require('mongoose');

const mockInterviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['senior'],
    default: 'senior'
  },
  status: {
    type: String,
    enum: ['requested', 'scheduled', 'completed', 'cancelled'],
    default: 'requested'
  },
  scheduledAt: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('MockInterview', mockInterviewSchema);
