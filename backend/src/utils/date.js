const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(customParseFormat);

const now = () => dayjs();

const todayDate = () => now().format('YYYY-MM-DD');

const currentTimestamp = () => now().toDate();

const parseDateTime = (date, time) => dayjs(`${date} ${time}`, 'YYYY-MM-DD HH:mm:ss');

const isTimeAfter = (time, referenceTime) => {
  const baseDate = '2000-01-01';
  const value = parseDateTime(baseDate, time);
  const ref = parseDateTime(baseDate, referenceTime);
  return value.isAfter(ref);
};

const calculateHours = (startAt, endAt) => {
  const start = dayjs(startAt);
  const end = dayjs(endAt);
  if (!start.isValid() || !end.isValid() || end.isBefore(start)) {
    return 0;
  }

  const minutes = end.diff(start, 'minute');
  return Number((minutes / 60).toFixed(2));
};

const getMonthRange = (month, year) => {
  const start = dayjs(`${year}-${month}-01`, 'YYYY-M-DD').startOf('month');
  const end = start.endOf('month');

  return {
    startDate: start.format('YYYY-MM-DD'),
    endDate: end.format('YYYY-MM-DD')
  };
};

const getLastNDates = (count = 7) => {
  const items = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    items.push(dayjs().subtract(i, 'day').format('YYYY-MM-DD'));
  }
  return items;
};

module.exports = {
  now,
  todayDate,
  currentTimestamp,
  isTimeAfter,
  calculateHours,
  getMonthRange,
  getLastNDates
};
