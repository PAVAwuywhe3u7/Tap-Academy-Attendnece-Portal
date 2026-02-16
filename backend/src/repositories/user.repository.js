const User = require('../models/user.model');
const { getNextSequence } = require('../utils/sequence');

const create = async (payload) => {
  const id = await getNextSequence('users');
  const user = await User.create({
    id,
    ...payload,
    email: String(payload.email).toLowerCase()
  });

  return user.toObject();
};

const findByEmail = (email) => User.findOne({ email: String(email).toLowerCase() }).lean();

const findById = (id) =>
  User.findOne(
    { id: Number(id) },
    {
      _id: 0,
      id: 1,
      name: 1,
      email: 1,
      role: 1,
      employee_code: 1,
      department: 1,
      created_at: 1
    }
  ).lean();

const findByIdWithPassword = (id) => User.findOne({ id: Number(id) }).lean();

const countByRole = (role) => User.countDocuments({ role });

const findAllEmployees = (department = null) => {
  const where = { role: 'employee' };
  if (department) {
    where.department = department;
  }

  return User.find(
    where,
    {
      _id: 0,
      id: 1,
      name: 1,
      email: 1,
      employee_code: 1,
      department: 1,
      created_at: 1
    }
  )
    .sort({ name: 1 })
    .lean();
};

const findDepartments = async () => {
  const departments = await User.distinct('department', { role: 'employee' });
  return departments.sort((a, b) => a.localeCompare(b)).map((department) => ({ department }));
};

const findMaxEmployeeCode = async () => {
  const [row] = await User.aggregate([
    {
      $match: {
        employee_code: {
          $regex: /^EMP\d+$/
        }
      }
    },
    {
      $project: {
        employee_code: 1,
        code_num: {
          $toInt: {
            $substrCP: [
              '$employee_code',
              3,
              {
                $subtract: [{ $strLenCP: '$employee_code' }, 3]
              }
            ]
          }
        }
      }
    },
    {
      $sort: {
        code_num: -1
      }
    },
    { $limit: 1 }
  ]);

  return row ? row.employee_code : null;
};

module.exports = {
  create,
  findByEmail,
  findById,
  findByIdWithPassword,
  countByRole,
  findAllEmployees,
  findDepartments,
  findMaxEmployeeCode
};
