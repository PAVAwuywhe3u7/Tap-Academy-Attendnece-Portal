const Attendance = require('../models/attendance.model');
const { getNextSequence } = require('../utils/sequence');

const parseNumber = (value) => Number(value);

const buildDateQuery = (from, to) => {
  if (from && to) {
    return { $gte: from, $lte: to };
  }

  if (from) {
    return { $gte: from };
  }

  if (to) {
    return { $lte: to };
  }

  return null;
};

const create = async (payload) => {
  const id = await getNextSequence('attendance');
  const record = await Attendance.create({
    id,
    ...payload
  });

  return record.toObject();
};

const bulkCreate = async (records) => {
  if (!records.length) {
    return [];
  }

  const docs = [];

  for (const record of records) {
    const id = await getNextSequence('attendance');
    docs.push({
      id,
      ...record
    });
  }

  const inserted = await Attendance.insertMany(docs, { ordered: false });
  return inserted.map((item) => item.toObject());
};

const findById = (id) => Attendance.findOne({ id: parseNumber(id) }).lean();

const findByUserAndDate = (userId, date) =>
  Attendance.findOne({
    user_id: parseNumber(userId),
    attendance_date: date
  }).lean();

const findOpenByUserAndDate = (userId, date) =>
  Attendance.findOne({
    user_id: parseNumber(userId),
    attendance_date: date,
    check_out_time: null
  }).lean();

const update = (record, payload) =>
  Attendance.findOneAndUpdate(
    {
      id: parseNumber(record.id)
    },
    {
      $set: payload
    },
    {
      new: true,
      lean: true
    }
  );

const findByDate = (date) =>
  Attendance.find(
    { attendance_date: date },
    {
      _id: 0,
      id: 1,
      user_id: 1,
      attendance_date: 1,
      status: 1,
      check_in_time: 1,
      check_out_time: 1,
      total_hours: 1
    }
  ).lean();

const findUserHistory = async (userId, { from, to, page, limit }) => {
  const where = {
    user_id: parseNumber(userId)
  };

  const dateQuery = buildDateQuery(from, to);
  if (dateQuery) {
    where.attendance_date = dateQuery;
  }

  const offset = (page - 1) * limit;

  const [count, rows] = await Promise.all([
    Attendance.countDocuments(where),
    Attendance.find(where)
      .sort({ attendance_date: -1, id: -1 })
      .skip(offset)
      .limit(limit)
      .lean()
  ]);

  return {
    count,
    rows
  };
};

const findUserByDateRange = (userId, startDate, endDate) =>
  Attendance.find({
    user_id: parseNumber(userId),
    attendance_date: {
      $gte: startDate,
      $lte: endDate
    }
  })
    .sort({ attendance_date: 1, id: 1 })
    .lean();

const aggregateUserByStatus = (userId, startDate, endDate) =>
  Attendance.aggregate([
    {
      $match: {
        user_id: parseNumber(userId),
        attendance_date: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        status: '$_id',
        count: 1
      }
    }
  ]);

const sumUserHours = async (userId, startDate, endDate) => {
  const [result] = await Attendance.aggregate([
    {
      $match: {
        user_id: parseNumber(userId),
        attendance_date: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: null,
        totalHours: { $sum: '$total_hours' }
      }
    },
    {
      $project: {
        _id: 0,
        totalHours: 1
      }
    }
  ]);

  return {
    totalHours: Number(result?.totalHours || 0)
  };
};

const buildAttendanceLookupPipeline = ({ from, to, employeeId, department, status }) => {
  const where = {};

  if (employeeId) {
    where.user_id = parseNumber(employeeId);
  }

  if (status) {
    where.status = status;
  }

  const dateQuery = buildDateQuery(from, to);
  if (dateQuery) {
    where.attendance_date = dateQuery;
  }

  const pipeline = [{ $match: where }];

  pipeline.push({
    $lookup: {
      from: 'users',
      localField: 'user_id',
      foreignField: 'id',
      as: 'employee'
    }
  });

  pipeline.push({ $unwind: '$employee' });

  if (department) {
    pipeline.push({
      $match: {
        'employee.department': department
      }
    });
  }

  return pipeline;
};

const findAllAttendance = async ({ from, to, employeeId, department, status, page, limit }) => {
  const offset = (page - 1) * limit;

  const pipeline = [
    ...buildAttendanceLookupPipeline({ from, to, employeeId, department, status }),
    { $sort: { attendance_date: -1, id: -1 } },
    {
      $facet: {
        rows: [
          { $skip: offset },
          { $limit: limit },
          {
            $project: {
              _id: 0,
              id: 1,
              user_id: 1,
              attendance_date: 1,
              check_in_time: 1,
              check_out_time: 1,
              status: 1,
              total_hours: 1,
              created_at: 1,
              employee: {
                id: '$employee.id',
                name: '$employee.name',
                email: '$employee.email',
                employee_code: '$employee.employee_code',
                department: '$employee.department'
              }
            }
          }
        ],
        total: [{ $count: 'count' }]
      }
    }
  ];

  const [result] = await Attendance.aggregate(pipeline);

  return {
    count: Number(result?.total?.[0]?.count || 0),
    rows: result?.rows || []
  };
};

const findEmployeeAttendance = (employeeId, options) =>
  findAllAttendance({
    ...options,
    employeeId,
    page: options.page,
    limit: options.limit
  });

const aggregateSummary = async ({ from, to, department }) => {
  const pipeline = [
    ...buildAttendanceLookupPipeline({ from, to, department }),
    {
      $facet: {
        byStatus: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          },
          {
            $project: {
              _id: 0,
              status: '$_id',
              count: 1
            }
          }
        ],
        totals: [
          {
            $group: {
              _id: null,
              totalRecords: { $sum: 1 },
              totalHours: { $sum: '$total_hours' }
            }
          },
          {
            $project: {
              _id: 0,
              totalRecords: 1,
              totalHours: 1
            }
          }
        ]
      }
    }
  ];

  const [result] = await Attendance.aggregate(pipeline);

  return {
    byStatus: result?.byStatus || [],
    totals: result?.totals?.[0] || { totalRecords: 0, totalHours: 0 }
  };
};

const findByDateWithEmployees = async (date, department = null) => {
  const pipeline = [
    ...buildAttendanceLookupPipeline({ from: date, to: date, department }),
    { $sort: { check_in_time: 1, id: 1 } },
    {
      $project: {
        _id: 0,
        id: 1,
        user_id: 1,
        attendance_date: 1,
        check_in_time: 1,
        check_out_time: 1,
        status: 1,
        total_hours: 1,
        created_at: 1,
        employee: {
          id: '$employee.id',
          name: '$employee.name',
          employee_code: '$employee.employee_code',
          department: '$employee.department',
          email: '$employee.email'
        }
      }
    }
  ];

  return Attendance.aggregate(pipeline);
};

module.exports = {
  create,
  bulkCreate,
  findById,
  findByUserAndDate,
  findOpenByUserAndDate,
  update,
  findByDate,
  findUserHistory,
  findUserByDateRange,
  aggregateUserByStatus,
  sumUserHours,
  findAllAttendance,
  findEmployeeAttendance,
  aggregateSummary,
  findByDateWithEmployees
};