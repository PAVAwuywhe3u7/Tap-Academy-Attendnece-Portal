const attendanceService = require('../services/attendance.service');
const asyncHandler = require('../utils/asyncHandler');

const checkIn = asyncHandler(async (req, res) => {
  const data = await attendanceService.checkIn(req.user.id);

  res.status(201).json({
    success: true,
    message: 'Checked in successfully',
    data
  });
});

const checkOut = asyncHandler(async (req, res) => {
  const data = await attendanceService.checkOut(req.user.id);

  res.json({
    success: true,
    message: 'Checked out successfully',
    data
  });
});

const myHistory = asyncHandler(async (req, res) => {
  const data = await attendanceService.getMyHistory(req.user.id, req.query);
  res.json({ success: true, data });
});

const mySummary = asyncHandler(async (req, res) => {
  const data = await attendanceService.getMySummary(req.user.id, req.query);
  res.json({ success: true, data });
});

const today = asyncHandler(async (req, res) => {
  const data = await attendanceService.getTodayAttendance(req.user.id);
  res.json({ success: true, data });
});

const allAttendance = asyncHandler(async (req, res) => {
  const data = await attendanceService.getAllAttendance(req.query);
  res.json({ success: true, data });
});

const employeeAttendance = asyncHandler(async (req, res) => {
  const data = await attendanceService.getEmployeeAttendance(req.params.id, req.query);
  res.json({ success: true, data });
});

const summary = asyncHandler(async (req, res) => {
  const data = await attendanceService.getSummary(req.query);
  res.json({ success: true, data });
});

const todayStatus = asyncHandler(async (req, res) => {
  const data = await attendanceService.getTodayStatus(req.query);
  res.json({ success: true, data });
});

const exportCsv = asyncHandler(async (req, res) => {
  const report = await attendanceService.exportAttendance(req.query);
  const fileSuffix = new Date().toISOString().split('T')[0];

  res.header('Content-Type', report.contentType);
  res.attachment(`attendance-report-${fileSuffix}.${report.extension}`);
  res.send(report.content);
});

const employees = asyncHandler(async (req, res) => {
  const data = await attendanceService.getEmployees(req.query);
  res.json({ success: true, data });
});

const departments = asyncHandler(async (_req, res) => {
  const data = await attendanceService.getDepartments();
  res.json({ success: true, data });
});

module.exports = {
  checkIn,
  checkOut,
  myHistory,
  mySummary,
  today,
  allAttendance,
  employeeAttendance,
  summary,
  todayStatus,
  exportCsv,
  employees,
  departments
};
