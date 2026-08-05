const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    default: '',
    maxlength: 500
  },
  link: {
    type: String,
    required: false,
    default: ''
  },
  fileType: {
    type: String,
    enum: ['link', 'pdf'],
    default: 'link'
  },
  fileName: {
    type: String,
    default: ''
  },
  filePath: {
    type: String,
    default: ''
  },
  cluster: {
    type: String,
    enum: ['CS', 'EC', 'AIML'],
    required: [true, 'Cluster is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required']
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approved: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);
