/* eslint-disable no-console */
const { connectDatabase, mongoose } = require('../../config/database');
const { User, Attendance } = require('../../models');

const demoUserEmails = [
  'manager@tapacademy.com',
  'anita@tapacademy.com',
  'karthik@tapacademy.com',
  'meera@tapacademy.com',
  'arjun@tapacademy.com'
];

const run = async () => {
  try {
    await connectDatabase();
    await Promise.all([User.init(), Attendance.init()]);

    const demoUsers = await User.find({ email: { $in: demoUserEmails } }, { id: 1, email: 1 }).lean();
    const demoUserIds = demoUsers.map((user) => user.id);

    if (demoUserIds.length === 0) {
      console.log('No demo users found. Nothing to clean.');
      await mongoose.connection.close();
      process.exit(0);
    }

    const [attendanceResult, userResult] = await Promise.all([
      Attendance.deleteMany({ user_id: { $in: demoUserIds } }),
      User.deleteMany({ id: { $in: demoUserIds } })
    ]);

    console.log(
      `Cleanup complete. Removed ${userResult.deletedCount} demo users and ${attendanceResult.deletedCount} demo attendance records.`
    );

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Demo cleanup failed', error);
    try {
      await mongoose.connection.close();
    } catch (_) {
      // ignore close error
    }
    process.exit(1);
  }
};

run();
