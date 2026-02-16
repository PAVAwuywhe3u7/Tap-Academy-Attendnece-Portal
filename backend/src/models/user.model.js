const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['employee', 'manager'],
      default: 'employee',
      required: true
    },
    employee_code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false,
    id: false,
    collection: 'users'
  }
);

module.exports = mongoose.model('User', userSchema);