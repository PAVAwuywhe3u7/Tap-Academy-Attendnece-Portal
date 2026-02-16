const { param, query, body } = require('express-validator');

const employeeIdValidator = [
  param('id').isInt({ min: 1 }).withMessage('Employee id must be a positive integer')
];

const attendanceQueryValidator = [
  query('from').optional().isISO8601().withMessage('from must be a valid date'),
  query('to').optional().isISO8601().withMessage('to must be a valid date'),
  query('month').optional().isInt({ min: 1, max: 12 }).withMessage('month must be 1-12'),
  query('year').optional().isInt({ min: 2000, max: 2100 }).withMessage('year must be valid'),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be >= 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1-100'),
  query('employeeId').optional().isInt({ min: 1 }).withMessage('employeeId must be a positive integer'),
  query('department').optional().isString().trim().isLength({ min: 2 }).withMessage('department must be valid'),
  query('format')
    .optional()
    .isIn(['csv', 'xlsx'])
    .withMessage('format must be csv/xlsx'),
  query('status')
    .optional()
    .isIn(['present', 'absent', 'late', 'half-day'])
    .withMessage('status must be present/absent/late/half-day')
];

const checkInValidator = [
  body('note').optional().trim().isLength({ max: 500 }).withMessage('Note must be max 500 characters')
];

const checkOutValidator = [
  body('note').optional().trim().isLength({ max: 500 }).withMessage('Note must be max 500 characters')
];

module.exports = {
  employeeIdValidator,
  attendanceQueryValidator,
  checkInValidator,
  checkOutValidator
};
