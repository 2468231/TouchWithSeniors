require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Query = require('./models/Query');
const Resource = require('./models/Resource');
const Opportunity = require('./models/Opportunity');
const InterviewExperience = require('./models/InterviewExperience');

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');

  await Promise.all([
    User.deleteMany({}),
    Query.deleteMany({}),
    Resource.deleteMany({}),
    Opportunity.deleteMany({}),
    InterviewExperience.deleteMany({})
  ]);

  // Admin — no password (email-only auth)
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@touchwithseniors.com',
    role: 'admin',
    college: 'RV College of Engineering',
    department: 'Computer Science',
    passoutYear: 2022,
    onboardingComplete: true
  });

  // Sample students (no password needed)
  const student1 = await User.create({
    name: 'Rahul Sharma',
    email: 'rahul.cs24@rvce.edu.in',
    role: 'student',
    college: 'RV College of Engineering',
    department: 'Computer Science',
    passoutYear: 2028,
    onboardingComplete: true
  });

  const student2 = await User.create({
    name: 'Priya Nair',
    email: 'priya.is23@bmsce.ac.in',
    role: 'student',
    college: 'BMS College of Engineering',
    department: 'Information Science',
    passoutYear: 2027,
    onboardingComplete: true
  });

  const senior = await User.create({
    name: 'Arjun Mehta',
    email: 'arjun.cs22@rvce.edu.in',
    role: 'senior',
    college: 'RV College of Engineering',
    department: 'Computer Science',
    passoutYear: 2026,
    onboardingComplete: true
  });

  // Queries
  await Query.insertMany([
    {
      title: 'What CGPA is required for top product companies like Google, Amazon?',
      tags: ['Placement', 'CGPA'],
      author: student1._id,
      upvotes: [student2._id, senior._id]
    },
    {
      title: 'How to prepare for DSA in 3 months for campus placements?',
      tags: ['DSA', 'Placement'],
      author: student2._id,
      upvotes: [student1._id]
    },
    {
      title: 'Is learning AI/ML worth it for freshers in 2025?',
      tags: ['AI', 'Placement'],
      author: student1._id,
      upvotes: [senior._id]
    },
    {
      title: 'How important is communication skills for technical interviews?',
      tags: ['Communication', 'Interview'],
      author: student2._id,
      upvotes: []
    },
    {
      title: 'Best resources for System Design for freshers?',
      tags: ['DSA', 'Resume'],
      author: student1._id,
      upvotes: [student2._id]
    }
  ]);

  // Opportunities
  const futureDate = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  await Opportunity.insertMany([
    { company: 'Google', role: 'Software Engineer Intern', location: 'Bangalore', deadline: futureDate(30), salary: '₹80,000/month', applyLink: 'https://careers.google.com', type: 'internship', tags: ['Product', 'MNC'], description: 'Summer internship for penultimate year students.', postedBy: admin._id },
    { company: 'Amazon', role: 'SDE-1', location: 'Hyderabad', deadline: futureDate(15), salary: '₹28 LPA', applyLink: 'https://amazon.jobs', type: 'fulltime', tags: ['Product', 'MNC'], description: 'Full time SDE role for 2025 batch.', postedBy: admin._id },
    { company: 'Razorpay', role: 'Backend Engineer Intern', location: 'Bangalore', deadline: futureDate(20), salary: '₹60,000/month', applyLink: 'https://razorpay.com/jobs', type: 'internship', tags: ['Startup', 'Product'], description: 'Work on payment infrastructure.', postedBy: admin._id },
    { company: 'Flipkart', role: 'SDE Intern', location: 'Bangalore', deadline: futureDate(25), salary: '₹70,000/month', applyLink: 'https://flipkartcareers.com', type: 'internship', tags: ['Product', 'MNC'], description: "Work with India's top e-commerce engineers.", postedBy: senior._id },
    { company: 'Zepto', role: 'Software Engineer', location: 'Mumbai (Remote)', deadline: futureDate(10), salary: '₹20-25 LPA', applyLink: 'https://zepto.com/careers', type: 'remote', tags: ['Startup'], description: 'Join fast-growing quick commerce startup.', postedBy: admin._id },
    { company: 'Microsoft', role: 'Software Engineer', location: 'Hyderabad', deadline: futureDate(45), salary: '₹32 LPA', applyLink: 'https://careers.microsoft.com', type: 'fulltime', tags: ['Product', 'MNC'], description: 'Full time SWE for 2025 freshers.', postedBy: admin._id }
  ]);

  // Interview Experiences
  await InterviewExperience.insertMany([
    {
      company: 'Amazon', role: 'SDE-1', interviewType: 'fulltime',
      process: 'Online Assessment → 2 DSA rounds → LLD round → HR round.',
      questions: ['Two Sum, LRU Cache, Merge Intervals', 'Design a parking lot', 'STAR behavioral questions'],
      tips: 'Focus on STAR format. Amazon leadership principles are crucial. Practice medium-hard LeetCode.',
      difficulty: 'hard', result: 'selected', author: senior._id, upvotes: [student1._id, student2._id], year: 2024
    },
    {
      company: 'Infosys', role: 'Systems Engineer', interviewType: 'fulltime',
      process: 'Online test (Aptitude + Coding) → Technical Interview → HR.',
      questions: ['Basic OOPs - Inheritance, Polymorphism', 'Simple arrays & strings', 'Tell about your project'],
      tips: 'Focus on OOPs basics, projects, communication. Not very hard.',
      difficulty: 'easy', result: 'selected', author: student1._id, upvotes: [student2._id], year: 2025
    },
    {
      company: 'Razorpay', role: 'SWE Intern', interviewType: 'internship',
      process: '1 DSA round → 1 System Design round → Culture fit.',
      questions: ['Binary trees, Graph BFS/DFS', 'Design rate limiter', 'Why Razorpay?'],
      tips: 'Think out loud. They care about your approach, not just the answer.',
      difficulty: 'medium', result: 'selected', author: senior._id, upvotes: [student1._id], year: 2024
    }
  ]);

  console.log('\n✅ Database seeded successfully!');
  console.log('');
  console.log('📧 Login with these emails:');
  console.log('   Admin:   admin@touchwithseniors.com');
  console.log('   Student: rahul.cs24@rvce.edu.in');
  console.log('   Senior:  arjun.cs22@rvce.edu.in');
  console.log('');
  console.log('🚀 Start server: node index.js');
  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
