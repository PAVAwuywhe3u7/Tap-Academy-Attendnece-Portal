import api from './api';

export const checkInApi = async () => {
  const { data } = await api.post('/attendance/checkin');
  return data.data;
};

export const checkOutApi = async () => {
  const { data } = await api.post('/attendance/checkout');
  return data.data;
};

export const myHistoryApi = async (params = {}) => {
  const { data } = await api.get('/attendance/my-history', { params });
  return data.data;
};

export const mySummaryApi = async (params = {}) => {
  const { data } = await api.get('/attendance/my-summary', { params });
  return data.data;
};

export const todayApi = async () => {
  const { data } = await api.get('/attendance/today');
  return data.data;
};

export const managerSummaryApi = async (params = {}) => {
  const { data } = await api.get('/attendance/summary', { params });
  return data.data;
};

export const todayStatusApi = async (params = {}) => {
  const { data } = await api.get('/attendance/today-status', { params });
  return data.data;
};

export const allAttendanceApi = async (params = {}) => {
  const { data } = await api.get('/attendance/all', { params });
  return data.data;
};

export const employeeAttendanceApi = async (employeeId, params = {}) => {
  const { data } = await api.get(`/attendance/employee/${employeeId}`, { params });
  return data.data;
};

export const employeesApi = async () => {
  const { data } = await api.get('/attendance/employees');
  return data.data;
};

export const departmentsApi = async () => {
  const { data } = await api.get('/attendance/departments');
  return data.data;
};

export const exportAttendanceApi = (params = {}) =>
  api.get('/attendance/export', {
    params,
    responseType: 'blob'
  });