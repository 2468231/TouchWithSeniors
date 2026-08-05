const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 5000
  },
  tags: [{
    type: String,
    enum: ['Placement', 'AI', 'Development', 'DSA', 'Academics', 'CGPA', 'Communication', 'Resume', 'Internship', 'Interview']
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dislikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  isPinned: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

querySchema.virtual('upvoteCount').get(function () {
  return this.upvotes.length;
});

querySchema.set('toJSON', { virtuals: true });
querySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Query', querySchema);
