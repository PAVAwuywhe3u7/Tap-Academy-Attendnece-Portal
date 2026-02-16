/* eslint-disable no-console */
const bcrypt = require('bcrypt');
const dayjs = require('dayjs');

const { connectDatabase, mongoose } = require('../../config/database');
const { User, Attendance } = require('../../models');
const { getNextSequence } = require('../../utils/sequence');
const { ATTENDANCE_STATUS } = require('../../constants/attendance');

const seedUsers = [
  {
    name: 'Rohit Sharma',
    email: 'manager@tapacademy.com',
    password: 'Manager@123',
    role: 'manager',
    employee_code: 'EMP001',
    department: 'Operations'
  },
  {
    name: 'Anita Verma',
    email: 'anita@tapacademy.com',
    password: 'Employee@123',
    role: 'employee',
    employee_code: 'EMP002',
    department: 'Engineering'
  },
  {
    name: 'Karthik S',
    email: 'karthik@tapacademy.com',
    password: 'Employee@123',
    role: 'employee',
    employee_code: 'EMP003',
    department: 'Engineering'
  },
  {
    name: 'Meera N',
    email: 'meera@tapacademy.com',
    password: 'Employee@123',
    role: 'employee',
    employee_code: 'EMP004',
    department: 'HR'
  },
  {
    name: 'Arjun P',
    email: 'arjun@tapacademy.com',
    password: 'Employee@123',
    role: 'employee',
    employee_code: 'EMP005',
    department: 'Finance'
  }
];
const seedEmployeeEmails = seedUsers
  .filter((user) => user.role === 'employee')
  .map((user) => user.email.toLowerCase());

const pickStatus = () => {
  const random = Math.random();
  if (random < 0.1) return ATTENDANCE_STATUS.ABSENT;
  if (random < 0.25) return ATTENDANCE_STATUS.LATE;
  if (random < 0.35) return ATTENDANCE_STATUS.HALF_DAY;
  return ATTENDANCE_STATUS.PRESENT;
};

const buildAttendanceRecord = (userId, date, status) => {
  if (status === ATTENDANCE_STATUS.ABSENT) {
    return {
      user_id: userId,
      attendance_date: date,
      status,
      check_in_time: null,
      check_out_time: null,
      total_hours: 0
    };
  }

  let checkInHour = 9;
  let checkInMinute = Math.floor(Math.random() * 20);

  if (status === ATTENDANCE_STATUS.LATE) {
    checkInHour = 9;
    checkInMinute = 31 + Math.floor(Math.random() * 20);
  }

  let totalHours = 8 + Math.random() * 1.5;
  if (status === ATTENDANCE_STATUS.HALF_DAY) {
    totalHours = 3 + Math.random() * 0.8;
  }

  const checkIn = dayjs(`${date} ${String(checkInHour).padStart(2, '0')}:${String(checkInMinute).padStart(2, '0')}:00`);
  const checkOut = checkIn.add(Math.round(totalHours * 60), 'minute');

  return {
    user_id: userId,
    attendance_date: date,
    status,
    check_in_time: checkIn.toDate(),
    check_out_time: checkOut.toDate(),
    total_hours: Number(totalHours.toFixed(2))
  };
};

const upsertSeedUsers = async () => {
  for (const userData of seedUsers) {
    const existing = await User.findOne({ email: userData.email.toLowerCase() });
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    if (existing) {
      await User.updateOne(
        { id: existing.id },
        {
          $set: {
            name: userData.name,
            email: userData.email.toLowerCase(),
            password: hashedPassword,
            role: userData.role,
            employee_code: userData.employee_code,
            department: userData.department
          }
        }
      );
      continue;
    }

    const nextId = await getNextSequence('users');

    await User.create({
      id: nextId,
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      role: userData.role,
      employee_code: userData.employee_code,
      department: userData.department
    });
  }
};

const seedAttendance = async () => {
  const users = await User.find({
    role: 'employee',
    email: { $in: seedEmployeeEmails }
  })
    .sort({ id: 1 })
    .lean();

  for (const user of users) {
    for (let i = 1; i <= 21; i += 1) {
      const date = dayjs().subtract(i, 'day');
      if (date.day() === 0) {
        continue;
      }

      const formattedDate = date.format('YYYY-MM-DD');
      const existing = await Attendance.findOne({ user_id: user.id, attendance_date: formattedDate }).lean();
      if (existing) {
        continue;
      }

      const status = pickStatus();
      const record = buildAttendanceRecord(user.id, formattedDate, status);
      const nextAttendanceId = await getNextSequence('attendance');

      await Attendance.create({
        id: nextAttendanceId,
        ...record
      });
    }
  }
};

const run = async () => {
  try {
    await connectDatabase();
    await Promise.all([User.init(), Attendance.init()]);
    const shouldSeedFakeAttendance = process.env.SEED_FAKE_ATTENDANCE === 'true';

    await upsertSeedUsers();

    if (shouldSeedFakeAttendance) {
      await seedAttendance();
    } else {
      console.log('SEED_FAKE_ATTENDANCE is not true; skipped demo attendance generation');
    }

    console.log('Seed completed successfully');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

run();
