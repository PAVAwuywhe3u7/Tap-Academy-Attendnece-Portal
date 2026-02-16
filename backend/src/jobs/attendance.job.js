const cron = require('node-cron');
const attendanceService = require('../services/attendance.service');
const env = require('../config/env');

const startAttendanceJob = () => {
  cron.schedule(
    '59 23 * * *',
    async () => {
      try {
        const result = await attendanceService.autoMarkAbsentForDate();
        console.log(`[cron] auto absent completed`, result);
      } catch (error) {
        console.error('[cron] auto absent failed', error.message);
      }
    },
    {
      timezone: env.app.timezone
    }
  );

  console.log('[cron] attendance absent scheduler registered for 23:59 daily');
};

module.exports = {
  startAttendanceJob
};