const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'senior', 'admin'],
    default: 'student'
  },
  college: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    default: ''
  },
  passoutYear: {
    type: Number,
    default: null
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500
  },
  onboardingComplete: {
    type: Boolean,
    default: false
  },
  bookmarkedOpportunities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity'
  }],
  stats: {
    queriesPosted: { type: Number, default: 0 },
    resourcesShared: { type: Number, default: 0 },
    interviewsCompleted: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get academic year
userSchema.virtual('academicYear').get(function () {
  if (!this.passoutYear) return null;
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const academicYear = currentMonth >= 8 ? currentYear : currentYear - 1;
  const diff = this.passoutYear - academicYear;
  if (diff === 4) return 'First Year';
  if (diff === 3) return 'Second Year';
  if (diff === 2) return 'Pre-Final Year';
  if (diff === 1) return 'Final Year';
  return 'Alumni';
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
