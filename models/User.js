// ==============================================================================
// User Model (Mongoose Schema)
// Stores registered students and administrators
// ==============================================================================

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your full name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please enter your email address'],
    unique: true,
    trim: true,
    lowercase: true
  },
  rollNo: {
    type: String,
    required: [true, 'Please enter your roll number or student ID'],
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  password: {
    type: String,
    required: [true, 'Please enter a password']
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
