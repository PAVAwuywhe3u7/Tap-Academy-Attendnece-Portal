import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  allAttendanceApi,
  checkInApi,
  checkOutApi,
  departmentsApi,
  employeesApi,
  myHistoryApi,
} from '../../services/attendance.api';
import { employeeDashboardApi, managerDashboardApi } from '../../services/dashboard.api';

export const fetchEmployeeDashboard = createAsyncThunk('attendance/fetchEmployeeDashboard', async (params = {}) =>
  employeeDashboardApi(params)
);

export const fetchMyHistory = createAsyncThunk('attendance/fetchMyHistory', async (params = {}) => myHistoryApi(params));

export const performCheckIn = createAsyncThunk('attendance/performCheckIn', async () => checkInApi());

export const performCheckOut = createAsyncThunk('attendance/performCheckOut', async () => checkOutApi());

export const fetchManagerDashboard = createAsyncThunk('attendance/fetchManagerDashboard', async (params = {}) =>
  managerDashboardApi(params)
);

export const fetchReportAttendance = createAsyncThunk('attendance/fetchReportAttendance', async (params = {}) =>
  allAttendanceApi(params)
);

export const fetchFiltersMeta = createAsyncThunk('attendance/fetchFiltersMeta', async () => {
  const [employees, departments] = await Promise.all([employeesApi(), departmentsApi()]);
  return { employees, departments };
});

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    employee: {
      today: null,
      summary: null,
      history: [],
      historyPagination: null
    },
    manager: {
      summary: null,
      todayStatus: null,
      reports: [],
      reportPagination: null,
      employees: [],
      departments: []
    },
    loading: {
      employeeDashboard: false,
      history: false,
      checkAction: false,
      managerDashboard: false,
      reports: false,
      meta: false
    },
    error: null
  },
  reducers: {
    clearAttendanceError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeeDashboard.pending, (state) => {
        state.loading.employeeDashboard = true;
        state.error = null;
      })
      .addCase(fetchEmployeeDashboard.fulfilled, (state, action) => {
        state.loading.employeeDashboard = false;
        state.employee.today = action.payload.today;
        state.employee.summary = action.payload.summary;
      })
      .addCase(fetchEmployeeDashboard.rejected, (state, action) => {
        state.loading.employeeDashboard = false;
        state.error = action.error.message;
      })

      .addCase(fetchMyHistory.pending, (state) => {
        state.loading.history = true;
        state.error = null;
      })
      .addCase(fetchMyHistory.fulfilled, (state, action) => {
        state.loading.history = false;
        state.employee.history = action.payload.records;
        state.employee.historyPagination = action.payload.pagination;
      })
      .addCase(fetchMyHistory.rejected, (state, action) => {
        state.loading.history = false;
        state.error = action.error.message;
      })

      .addCase(performCheckIn.pending, (state) => {
        state.loading.checkAction = true;
        state.error = null;
      })
      .addCase(performCheckIn.fulfilled, (state, action) => {
        state.loading.checkAction = false;
        state.employee.today = action.payload;
      })
      .addCase(performCheckIn.rejected, (state, action) => {
        state.loading.checkAction = false;
        state.error = action.error.message;
      })

      .addCase(performCheckOut.pending, (state) => {
        state.loading.checkAction = true;
        state.error = null;
      })
      .addCase(performCheckOut.fulfilled, (state, action) => {
        state.loading.checkAction = false;
        state.employee.today = action.payload;
      })
      .addCase(performCheckOut.rejected, (state, action) => {
        state.loading.checkAction = false;
        state.error = action.error.message;
      })

      .addCase(fetchManagerDashboard.pending, (state) => {
        state.loading.managerDashboard = true;
        state.error = null;
      })
      .addCase(fetchManagerDashboard.fulfilled, (state, action) => {
        state.loading.managerDashboard = false;
        state.manager.summary = action.payload.summary;
        state.manager.todayStatus = action.payload.todayStatus;
      })
      .addCase(fetchManagerDashboard.rejected, (state, action) => {
        state.loading.managerDashboard = false;
        state.error = action.error.message;
      })

      .addCase(fetchReportAttendance.pending, (state) => {
        state.loading.reports = true;
        state.error = null;
      })
      .addCase(fetchReportAttendance.fulfilled, (state, action) => {
        state.loading.reports = false;
        state.manager.reports = action.payload.records;
        state.manager.reportPagination = action.payload.pagination;
      })
      .addCase(fetchReportAttendance.rejected, (state, action) => {
        state.loading.reports = false;
        state.error = action.error.message;
      })

      .addCase(fetchFiltersMeta.pending, (state) => {
        state.loading.meta = true;
      })
      .addCase(fetchFiltersMeta.fulfilled, (state, action) => {
        state.loading.meta = false;
        state.manager.employees = action.payload.employees;
        state.manager.departments = action.payload.departments;
      })
      .addCase(fetchFiltersMeta.rejected, (state, action) => {
        state.loading.meta = false;
        state.error = action.error.message;
      });
  }
});

export const { clearAttendanceError } = attendanceSlice.actions;

export default attendanceSlice.reducer;
