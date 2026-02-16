import dayjs from 'dayjs';

export const formatDate = (value, pattern = 'DD MMM YYYY') => {
  if (!value) return '-';
  return dayjs(value).format(pattern);
};

export const formatDateTime = (value) => {
  if (!value) return '-';
  return dayjs(value).format('DD MMM YYYY, hh:mm A');
};

export const formatTime = (value) => {
  if (!value) return '-';
  return dayjs(value).format('hh:mm A');
};

export const statusColor = (status) => {
  switch (status) {
    case 'present':
      return 'status-chip status-present';
    case 'late':
      return 'status-chip status-late';
    case 'half-day':
      return 'status-chip status-half-day';
    case 'absent':
      return 'status-chip status-absent';
    default:
      return 'status-chip status-unknown';
  }
};

export const getStatusEventColor = (status) => {
  switch (status) {
    case 'present':
      return '#10b981';
    case 'late':
      return '#facc15';
    case 'half-day':
      return '#fb923c';
    case 'absent':
      return '#fb7185';
    default:
      return '#94a3b8';
  }
};

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export const toTitleCase = (value) =>
  value
    ? value
        .split(/[-_ ]/)
        .filter(Boolean)
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(' ')
    : '';
