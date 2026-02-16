const asyncHandler = require('../utils/asyncHandler');
const dashboardService = require('../services/dashboard.service');

const employeeDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getEmployeeDashboard(req.user.id, req.query);
  res.json({ success: true, data });
});

const managerDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getManagerDashboard(req.query);
  res.json({ success: true, data });
});

module.exports = {
  employeeDashboard,
  managerDashboard
};
