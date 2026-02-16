const express = require('express');
const attendanceController = require('../controllers/attendance.controller');
const validate = require('../middlewares/validate.middleware');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const {
  attendanceQueryValidator,
  employeeIdValidator,
  checkInValidator,
  checkOutValidator
} = require('../validators/attendance.validator');

const router = express.Router();

router.use(authenticate);

router.post('/checkin', authorize('employee'), checkInValidator, validate, attendanceController.checkIn);
router.post('/checkout', authorize('employee'), checkOutValidator, validate, attendanceController.checkOut);
router.get('/my-history', authorize('employee'), attendanceQueryValidator, validate, attendanceController.myHistory);
router.get('/my-summary', authorize('employee'), attendanceQueryValidator, validate, attendanceController.mySummary);
router.get('/today', authorize('employee'), attendanceController.today);

router.get('/all', authorize('manager'), attendanceQueryValidator, validate, attendanceController.allAttendance);
router.get('/employee/:id', authorize('manager'), employeeIdValidator, attendanceQueryValidator, validate, attendanceController.employeeAttendance);
router.get('/summary', authorize('manager'), attendanceQueryValidator, validate, attendanceController.summary);
router.get('/export', authorize('manager'), attendanceQueryValidator, validate, attendanceController.exportCsv);
router.get('/today-status', authorize('manager'), attendanceQueryValidator, validate, attendanceController.todayStatus);
router.get('/employees', authorize('manager'), attendanceController.employees);
router.get('/departments', authorize('manager'), attendanceController.departments);

module.exports = router;
