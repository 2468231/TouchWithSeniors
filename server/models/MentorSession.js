const mongoose = require('mongoose');

const mentorSessionSchema = new mongoose.Schema({
  // Submitted by senior
  seniorName: {
    type: String,
    required: [true, 'Your name is required'],
    trim: true
  },
  contact: {
    type: String,
    required: [true, 'Contact number is required'],
    trim: true
  },
  expertise: {
    type: String,
    required: [true, 'Expertise/topic is required'],
    trim: true
  },
  preferredDate: {
    type: String,
    required: true
  },
  preferredTime: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: '',
    maxlength: 1000
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Set by Admin after approval
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  googleMeetLink: {
    type: String,
    default: ''
  },
  confirmedDate: {
    type: String,
    default: ''
  },
  confirmedTime: {
    type: String,
    default: ''
  },
  adminNote: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('MentorSession', mentorSessionSchema);
