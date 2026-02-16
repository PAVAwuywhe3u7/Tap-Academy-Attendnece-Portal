const ApiError = require('../utils/ApiError');
const { verifyToken } = require('../utils/jwt');
const userRepository = require('../repositories/user.repository');

const authenticate = async (req, _res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return next(new ApiError(401, 'Authentication token missing'));
  }

  try {
    const payload = verifyToken(token);
    const user = await userRepository.findById(payload.id);

    if (!user) {
      return next(new ApiError(401, 'Invalid token user'));
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
};

const authorize = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, 'Forbidden: insufficient permissions'));
  }

  return next();
};

module.exports = {
  authenticate,
  authorize
};