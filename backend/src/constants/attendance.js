const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  HALF_DAY: 'half-day'
};

const CHECK_IN_CUTOFF = '09:30:00';
const ABSENT_MARK_TIME = '23:59:00';
const HALF_DAY_HOURS = 4;

module.exports = {
  ATTENDANCE_STATUS,
  CHECK_IN_CUTOFF,
  ABSENT_MARK_TIME,
  HALF_DAY_HOURS
};