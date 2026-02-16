const attendanceService = require('./attendance.service');

const getEmployeeDashboard = async (userId, query) => {
  const [today, summary] = await Promise.all([
    attendanceService.getTodayAttendance(userId),
    attendanceService.getMySummary(userId, query)
  ]);

  return {
    today,
    summary
  };
};

const getManagerDashboard = async (query) => {
  const [summary, todayStatus] = await Promise.all([
    attendanceService.getSummary(query),
    attendanceService.getTodayStatus(query)
  ]);

  return {
    summary,
    todayStatus
  };
};

module.exports = {
  getEmployeeDashboard,
  getManagerDashboard
};
