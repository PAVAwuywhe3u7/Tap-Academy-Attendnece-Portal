import api from './api';

export const employeeDashboardApi = async (params = {}) => {
  const { data } = await api.get('/dashboard/employee', { params });
  return data.data;
};

export const managerDashboardApi = async (params = {}) => {
  const { data } = await api.get('/dashboard/manager', { params });
  return data.data;
};
