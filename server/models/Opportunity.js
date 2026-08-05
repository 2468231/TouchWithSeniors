const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
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
  location: {
    type: String,
    default: 'Remote'
  },
  deadline: {
    type: Date,
    required: true
  },
  salary: {
    type: String,
    default: 'Not Disclosed'
  },
  applyLink: {
    type: String,
    required: [true, 'Apply link is required']
  },
  type: {
    type: String,
    enum: ['internship', 'fulltime', 'remote'],
    required: true
  },
  tags: [{
    type: String,
    enum: ['Product', 'Startup', 'Service', 'MNC', 'Remote']
  }],
  description: {
    type: String,
    default: ''
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Opportunity', opportunitySchema);
