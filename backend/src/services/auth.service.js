const bcrypt = require('bcrypt');
const ApiError = require('../utils/ApiError');
const { signToken } = require('../utils/jwt');
const userRepository = require('../repositories/user.repository');

const SALT_ROUNDS = 10;

const generateEmployeeCode = async () => {
  const currentCode = await userRepository.findMaxEmployeeCode();

  if (!currentCode) {
    return 'EMP001';
  }

  const numeric = Number(String(currentCode).replace('EMP', ''));
  const nextNumber = Number.isNaN(numeric) ? 1 : numeric + 1;
  return `EMP${String(nextNumber).padStart(3, '0')}`;
};

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  employeeCode: user.employee_code,
  department: user.department,
  createdAt: user.created_at
});

const register = async ({ name, email, password, role, department }) => {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw new ApiError(409, 'Email already registered');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const employeeCode = await generateEmployeeCode();

  const user = await userRepository.create({
    name,
    email,
    password: hashedPassword,
    role,
    employee_code: employeeCode,
    department
  });

  const token = signToken({ id: user.id, role: user.role });

  return {
    token,
    user: sanitizeUser(user)
  };
};

const login = async ({ email, password }) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = signToken({ id: user.id, role: user.role });

  return {
    token,
    user: sanitizeUser(user)
  };
};

const me = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return sanitizeUser(user);
};

module.exports = {
  register,
  login,
  me
};