const dayjs = require('dayjs');
const { Parser } = require('json2csv');
const XLSX = require('xlsx');

const attendanceRepository = require('../repositories/attendance.repository');
const userRepository = require('../repositories/user.repository');
const ApiError = require('../utils/ApiError');
const {
  todayDate,
  currentTimestamp,
  isTimeAfter,
  calculateHours,
  getMonthRange,
  getLastNDates
} = require('../utils/date');
const { ATTENDANCE_STATUS, CHECK_IN_CUTOFF, HALF_DAY_HOURS } = require('../constants/attendance');

const parsePagination = (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 1000);
  return { page, limit };
};

const mapAttendanceRecord = (record) => ({
  id: record.id,
  userId: record.user_id,
  attendanceDate: record.attendance_date,
  checkInTime: record.check_in_time,
  checkOutTime: record.check_out_time,
  status: record.status,
  totalHours: Number(record.total_hours),
  createdAt: record.created_at,
  employee: record.employee
    ? {
        id: record.employee.id,
        name: record.employee.name,
        email: record.employee.email,
        employeeCode: record.employee.employee_code,
        department: record.employee.department
      }
    : undefined
});

const mapStatusCounts = (rows) => {
  const base = {
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0
  };

  rows.forEach((entry) => {
    const key = entry.status;
    const count = Number(entry.count || entry.dataValues?.count || 0);

    if (key === ATTENDANCE_STATUS.HALF_DAY) {
      base.halfDay = count;
      return;
    }

    if (Object.prototype.hasOwnProperty.call(base, key)) {
      base[key] = count;
    }
  });

  return base;
};

const checkIn = async (userId) => {
  const date = todayDate();
  const nowTime = currentTimestamp();
  const currentTime = dayjs(nowTime).format('HH:mm:ss');
  const status = isTimeAfter(currentTime, CHECK_IN_CUTOFF)
    ? ATTENDANCE_STATUS.LATE
    : ATTENDANCE_STATUS.PRESENT;

  const existing = await attendanceRepository.findByUserAndDate(userId, date);

  if (existing && existing.check_in_time) {
    throw new ApiError(409, 'Check-in already recorded for today');
  }

  if (existing) {
    const updated = await attendanceRepository.update(existing, {
      check_in_time: nowTime,
      status,
      total_hours: 0
    });
    return mapAttendanceRecord(updated);
  }

  const created = await attendanceRepository.create({
    user_id: userId,
    attendance_date: date,
    check_in_time: nowTime,
    status,
    total_hours: 0
  });

  return mapAttendanceRecord(created);
};

const checkOut = async (userId) => {
  const date = todayDate();
  const nowTime = currentTimestamp();

  const openRecord = await attendanceRepository.findOpenByUserAndDate(userId, date);
  if (!openRecord) {
    const existing = await attendanceRepository.findByUserAndDate(userId, date);
    if (existing && existing.check_out_time) {
      throw new ApiError(409, 'Check-out already completed for today');
    }
    throw new ApiError(400, 'Please check-in before check-out');
  }

  const totalHours = calculateHours(openRecord.check_in_time, nowTime);

  let finalStatus = openRecord.status;
  if (totalHours < HALF_DAY_HOURS) {
    finalStatus = ATTENDANCE_STATUS.HALF_DAY;
  }

  const updated = await attendanceRepository.update(openRecord, {
    check_out_time: nowTime,
    total_hours: totalHours,
    status: finalStatus
  });

  return mapAttendanceRecord(updated);
};

const getTodayAttendance = async (userId) => {
  const today = todayDate();
  const record = await attendanceRepository.findByUserAndDate(userId, today);
  return record ? mapAttendanceRecord(record) : null;
};

const getMyHistory = async (userId, query) => {
  const { page, limit } = parsePagination(query);
  const { from, to } = query;

  const { count, rows } = await attendanceRepository.findUserHistory(userId, {
    from,
    to,
    page,
    limit
  });

  return {
    records: rows.map(mapAttendanceRecord),
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit)
    }
  };
};

const getMySummary = async (userId, query) => {
  const current = dayjs();
  const month = Number(query.month || current.format('M'));
  const year = Number(query.year || current.format('YYYY'));
  const last7Dates = getLastNDates(7);
  const last7Start = last7Dates[0];
  const last7End = last7Dates[last7Dates.length - 1];

  const { startDate, endDate } = getMonthRange(month, year);
  const [statusRows, hoursRow, activityRows] = await Promise.all([
    attendanceRepository.aggregateUserByStatus(userId, startDate, endDate),
    attendanceRepository.sumUserHours(userId, startDate, endDate),
    attendanceRepository.findUserByDateRange(userId, last7Start, last7End)
  ]);

  const statusSummary = mapStatusCounts(statusRows.map((item) => item.dataValues || item));
  const totalHours = Number(hoursRow?.totalHours || 0);

  const activityMap = new Map(
    activityRows.map((row) => [
      row.attendance_date,
      {
        status: row.status,
        totalHours: Number(row.total_hours)
      }
    ])
  );

  const last7DaysActivity = last7Dates.map((date) => ({
    date,
    status: activityMap.get(date)?.status || ATTENDANCE_STATUS.ABSENT,
    totalHours: activityMap.get(date)?.totalHours || 0
  }));

  return {
    month,
    year,
    statusSummary,
    totalHours,
    last7DaysActivity
  };
};

const getAllAttendance = async (query) => {
  const { page, limit } = parsePagination(query);
  const { from, to, employeeId, department, status } = query;

  const { count, rows } = await attendanceRepository.findAllAttendance({
    from,
    to,
    employeeId,
    department,
    status,
    page,
    limit
  });

  return {
    records: rows.map(mapAttendanceRecord),
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit)
    }
  };
};

const getEmployeeAttendance = async (employeeId, query) => {
  const { page, limit } = parsePagination(query);
  const { from, to, status } = query;

  const { count, rows } = await attendanceRepository.findEmployeeAttendance(employeeId, {
    from,
    to,
    status,
    page,
    limit
  });

  return {
    records: rows.map(mapAttendanceRecord),
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit)
    }
  };
};

const getSummary = async (query) => {
  const { from, to, department } = query;
  const today = todayDate();

  const [aggregated, totalEmployees, todayRows] = await Promise.all([
    attendanceRepository.aggregateSummary({ from, to, department }),
    department ? userRepository.findAllEmployees(department).then((rows) => rows.length) : userRepository.countByRole('employee'),
    attendanceRepository.findByDateWithEmployees(today, department)
  ]);

  const statusSummary = mapStatusCounts(aggregated.byStatus);
  const totalRecords = Number(aggregated.totals?.totalRecords || 0);
  const totalHours = Number(aggregated.totals?.totalHours || 0);

  const lateArrivals = todayRows.filter((row) => row.status === ATTENDANCE_STATUS.LATE).length;

  const weekDates = getLastNDates(7);
  const weeklyTrend = await Promise.all(
    weekDates.map(async (date) => {
      const rows = await attendanceRepository.findByDateWithEmployees(date, department);
      const counts = {
        present: 0,
        late: 0,
        absent: 0,
        halfDay: 0
      };

      rows.forEach((row) => {
        if (row.status === ATTENDANCE_STATUS.HALF_DAY) {
          counts.halfDay += 1;
        } else if (row.status in counts) {
          counts[row.status] += 1;
        }
      });

      return {
        date,
        ...counts
      };
    })
  );

  const departmentMap = new Map();
  todayRows.forEach((row) => {
    const dept = row.employee.department;
    if (!departmentMap.has(dept)) {
      departmentMap.set(dept, 0);
    }

    if (row.status === ATTENDANCE_STATUS.PRESENT || row.status === ATTENDANCE_STATUS.LATE || row.status === ATTENDANCE_STATUS.HALF_DAY) {
      departmentMap.set(dept, departmentMap.get(dept) + 1);
    }
  });

  const departmentWise = Array.from(departmentMap.entries()).map(([dept, value]) => ({
    department: dept,
    value
  }));

  return {
    filters: { from, to, department },
    stats: {
      totalEmployees,
      totalRecords,
      totalHours,
      lateArrivals,
      ...statusSummary
    },
    weeklyTrend,
    departmentWise
  };
};

const getTodayStatus = async (query) => {
  const date = todayDate();
  const department = query.department || null;

  const [todayRows, employees] = await Promise.all([
    attendanceRepository.findByDateWithEmployees(date, department),
    userRepository.findAllEmployees(department)
  ]);

  const recordedIds = new Set(todayRows.map((row) => row.user_id));

  const absentEmployees = employees
    .filter((employee) => !recordedIds.has(employee.id))
    .map((employee) => ({
      id: employee.id,
      name: employee.name,
      employeeCode: employee.employee_code,
      department: employee.department
    }));

  const breakdown = {
    present: 0,
    late: 0,
    halfDay: 0,
    absent: absentEmployees.length
  };

  todayRows.forEach((row) => {
    if (row.status === ATTENDANCE_STATUS.HALF_DAY) {
      breakdown.halfDay += 1;
      return;
    }

    if (Object.prototype.hasOwnProperty.call(breakdown, row.status)) {
      breakdown[row.status] += 1;
    }
  });

  const lateArrivals = todayRows
    .filter((row) => row.status === ATTENDANCE_STATUS.LATE)
    .map((row) => ({
      id: row.employee.id,
      name: row.employee.name,
      employeeCode: row.employee.employee_code,
      department: row.employee.department,
      checkInTime: row.check_in_time
    }));

  return {
    date,
    breakdown,
    totalEmployees: employees.length,
    lateArrivals,
    absentEmployees,
    records: todayRows.map(mapAttendanceRecord)
  };
};

const exportAttendance = async (query) => {
  const { from, to, employeeId, department, status, format = 'xlsx' } = query;

  const { rows } = await attendanceRepository.findAllAttendance({
    from,
    to,
    employeeId,
    department,
    status,
    page: 1,
    limit: 100000
  });

  const exportRows = rows.map((item) => ({
    attendanceDate: item.attendance_date,
    employeeName: item.employee.name,
    employeeCode: item.employee.employee_code,
    department: item.employee.department,
    status: item.status,
    checkInTime: item.check_in_time,
    checkOutTime: item.check_out_time,
    totalHours: Number(item.total_hours)
  }));

  const parser = new Parser({
    fields: [
      'attendanceDate',
      'employeeName',
      'employeeCode',
      'department',
      'status',
      'checkInTime',
      'checkOutTime',
      'totalHours'
    ]
  });

  if (format === 'csv') {
    return {
      content: parser.parse(exportRows),
      contentType: 'text/csv',
      extension: 'csv'
    };
  }

  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

  return {
    content: XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }),
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extension: 'xlsx'
  };
};

const getEmployees = async (query) => {
  const rows = await userRepository.findAllEmployees(query.department || null);
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    employeeCode: row.employee_code,
    department: row.department
  }));
};

const getDepartments = async () => {
  const rows = await userRepository.findDepartments();
  return rows.map((row) => row.department);
};

const autoMarkAbsentForDate = async (date = todayDate()) => {
  const [employees, existingAttendance] = await Promise.all([
    userRepository.findAllEmployees(),
    attendanceRepository.findByDate(date)
  ]);

  const existingUserIds = new Set(existingAttendance.map((row) => row.user_id));

  const absents = employees
    .filter((employee) => !existingUserIds.has(employee.id))
    .map((employee) => ({
      user_id: employee.id,
      attendance_date: date,
      status: ATTENDANCE_STATUS.ABSENT,
      total_hours: 0,
      check_in_time: null,
      check_out_time: null
    }));

  if (absents.length > 0) {
    await attendanceRepository.bulkCreate(absents);
  }

  return {
    date,
    markedAbsent: absents.length
  };
};

module.exports = {
  checkIn,
  checkOut,
  getTodayAttendance,
  getMyHistory,
  getMySummary,
  getAllAttendance,
  getEmployeeAttendance,
  getSummary,
  getTodayStatus,
  exportAttendance,
  getEmployees,
  getDepartments,
  autoMarkAbsentForDate
};
