const express = require('express');
const authRoutes = require('./auth.routes');
const attendanceRoutes = require('./attendance.routes');
const dashboardRoutes = require('./dashboard.routes');

const router = express.Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Attendance API is running', version: 'v1' });
});

// API v1 routes
router.use('/auth', authRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
