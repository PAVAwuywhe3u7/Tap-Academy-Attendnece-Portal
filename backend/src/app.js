const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const apiRoutes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');
const { apiLimiter } = require('./middlewares/rateLimiter.middleware');

const app = express();
const normalizeOrigin = (value) => String(value || '').trim().replace(/\/+$/, '').toLowerCase();
const configuredOrigins = (env.cors.origins || []).map(normalizeOrigin);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (env.nodeEnv !== 'production') {
        callback(null, true);
        return;
      }

      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = normalizeOrigin(origin);
      const isConfigured = configuredOrigins.includes(normalizedOrigin);
      const isVercelDomain = normalizedOrigin.endsWith('.vercel.app');

      callback(null, isConfigured || isVercelDomain);
    },
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));

// Apply general rate limiting to all API routes
app.use('/api', apiLimiter);

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Tap Academy Attendance API'
  });
});

app.use('/api', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
