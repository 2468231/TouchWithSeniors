const mongoose = require('mongoose');

const interviewExperienceSchema = new mongoose.Schema({
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    trim: true
  },
  interviewType: {
    type: String,
    enum: ['internship', 'fulltime', 'ppo'],
    default: 'fulltime'
  },
  process: {
    type: String,
    required: [true, 'Interview process is required'],
    maxlength: 5000
  },
  questions: [{
    type: String
  }],
  tips: {
    type: String,
    maxlength: 2000
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  result: {
    type: String,
    enum: ['selected', 'rejected', 'pending'],
    default: 'pending'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  year: {
    type: Number,
    default: () => new Date().getFullYear()
  }
}, { timestamps: true });

module.exports = mongoose.model('InterviewExperience', interviewExperienceSchema);
