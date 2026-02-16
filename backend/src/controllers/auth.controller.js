const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const payload = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role || 'employee',
    department: req.body.department
  };

  const result = await authService.register(payload);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: result
  });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login({
    email: req.body.email,
    password: req.body.password
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: result
  });
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.me(req.user.id);

  res.json({
    success: true,
    data: user
  });
});

module.exports = {
  register,
  login,
  me
};