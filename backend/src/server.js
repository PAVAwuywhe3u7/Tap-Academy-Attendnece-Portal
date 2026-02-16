const app = require('./app');
const env = require('./config/env');
const { connectDatabase } = require('./config/database');
const { User, Attendance } = require('./models');
const { startAttendanceJob } = require('./jobs/attendance.job');
const logger = require('./utils/logger');

const startServer = async () => {
  try {
    await connectDatabase();
    await Promise.all([User.init(), Attendance.init()]);

    app.listen(env.port, () => {
      logger.info(`Server running on port ${env.port} (${env.nodeEnv})`);
    });

    startAttendanceJob();
  } catch (error) {
    logger.error('Failed to start server', {
      message: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

startServer();
