const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
      index: true
    },
    user_id: {
      type: Number,
      required: true,
      index: true
    },
    attendance_date: {
      type: String,
      required: true,
      index: true
    },
    check_in_time: {
      type: Date,
      default: null
    },
    check_out_time: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'half-day'],
      default: 'present',
      required: true
    },
    total_hours: {
      type: Number,
      default: 0
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false,
    id: false,
    collection: 'attendance'
  }
);

attendanceSchema.index({ user_id: 1, attendance_date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);