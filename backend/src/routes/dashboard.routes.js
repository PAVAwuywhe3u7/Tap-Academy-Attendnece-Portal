const express = require('express');

const dashboardController = require('../controllers/dashboard.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { attendanceQueryValidator } = require('../validators/attendance.validator');

const router = express.Router();

router.use(authenticate);

router.get('/employee', authorize('employee'), attendanceQueryValidator, validate, dashboardController.employeeDashboard);
router.get('/manager', authorize('manager'), attendanceQueryValidator, validate, dashboardController.managerDashboard);

module.exports = router;
