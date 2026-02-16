const rateLimit = require('express-rate-limit');

const parsePositiveInt = (value, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
};

const shouldSkipRateLimit = (req) => {
  if (process.env.SKIP_RATE_LIMIT === 'true') {
    return true;
  }

  // Do not rate-limit CORS preflight requests.
  if (req.method === 'OPTIONS') {
    return true;
  }

  return false;
};

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parsePositiveInt(process.env.API_RATE_LIMIT_MAX, 300), // limit each IP to 300 requests per window
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: shouldSkipRateLimit
});

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parsePositiveInt(process.env.AUTH_RATE_LIMIT_MAX, 20), // per IP+email bucket
  message: 'Too many login/register attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    return email ? `${ip}:${email}` : ip;
  },
  // Do not penalize successful login/register requests.
  skipSuccessfulRequests: true,
  skip: shouldSkipRateLimit
});

// Rate limiter for check-in/check-out
const attendanceLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parsePositiveInt(process.env.ATTENDANCE_RATE_LIMIT_MAX, 30), // limit each IP to 30 requests per minute
  message: 'Too many attendance requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldSkipRateLimit
});

module.exports = {
  apiLimiter,
  authLimiter,
  attendanceLimiter
};
