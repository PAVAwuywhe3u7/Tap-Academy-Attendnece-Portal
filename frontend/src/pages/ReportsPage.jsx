import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';

import AppLayout from '../components/layout/AppLayout';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import StatusBadge from '../components/ui/StatusBadge';
import { fetchFiltersMeta, fetchReportAttendance } from '../features/attendance/attendanceSlice';
import { exportAttendanceApi } from '../services/attendance.api';
import { downloadBlob, formatDate, formatDateTime } from '../utils/format';

const ReportsPage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const reports = useSelector((state) => state.attendance.manager.reports);
  const pagination = useSelector((state) => state.attendance.manager.reportPagination);
  const employees = useSelector((state) => state.attendance.manager.employees);
  const departments = useSelector((state) => state.attendance.manager.departments);
  const loading = useSelector((state) => state.attendance.loading.reports);

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filters, setFilters] = useState({
    from: dayjs().startOf('month').format('YYYY-MM-DD'),
    to: dayjs().format('YYYY-MM-DD'),
    employeeId: '',
    department: '',
    status: '',
    page: 1,
    limit: 12
  });

  useEffect(() => {
    dispatch(fetchFiltersMeta());
  }, [dispatch]);

  useEffect(() => {
    const payload = {
      from: filters.from,
      to: filters.to,
      page: filters.page,
      limit: filters.limit
    };

    if (filters.employeeId) payload.employeeId = filters.employeeId;
    if (filters.department) payload.department = filters.department;
    if (filters.status) payload.status = filters.status;

    dispatch(fetchReportAttendance(payload));
  }, [dispatch, filters]);

  const onExport = async () => {
    const params = {
      from: filters.from,
      to: filters.to,
      format: 'csv'
    };

    if (filters.employeeId) params.employeeId = filters.employeeId;
    if (filters.department) params.department = filters.department;
    if (filters.status) params.status = filters.status;

    const response = await exportAttendanceApi(params);
    downloadBlob(response.data, `attendance-report-${dayjs().format('YYYY-MM-DD')}.csv`);
  };

  return (
    <AppLayout role={user?.role}>
      <section className="glass-card p-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <label className="space-y-2 text-sm text-slate-200">
            <span>From</span>
            <input
              type="date"
              className="input-control"
              value={filters.from}
              onChange={(event) => setFilters((prev) => ({ ...prev, from: event.target.value, page: 1 }))}
            />
          </label>

          <label className="space-y-2 text-sm text-slate-200">
            <span>To</span>
            <input
              type="date"
              className="input-control"
              value={filters.to}
              onChange={(event) => setFilters((prev) => ({ ...prev, to: event.target.value, page: 1 }))}
            />
          </label>

          <label className="space-y-2 text-sm text-slate-200">
            <span>Employee</span>
            <select
              className="input-control"
              value={filters.employeeId}
              onChange={(event) => setFilters((prev) => ({ ...prev, employeeId: event.target.value, page: 1 }))}
            >
              <option value="">All Employees</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-200">
            <span>Department</span>
            <select
              className="input-control"
              value={filters.department}
              onChange={(event) => setFilters((prev) => ({ ...prev, department: event.target.value, page: 1 }))}
            >
              <option value="">All Departments</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-200">
            <span>Status</span>
            <select
              className="input-control"
              value={filters.status}
              onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value, page: 1 }))}
            >
              <option value="">All Statuses</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half-day">Half-day</option>
            </select>
          </label>

          <div className="flex items-end gap-2">
            <button className="btn-gradient w-full" type="button" onClick={onExport}>
              Export CSV
            </button>
          </div>
        </div>
      </section>

      <section className="glass-card mt-6 p-5">
        {loading ? (
          <div className="space-y-3">
            <LoadingSkeleton className="h-14" />
            <LoadingSkeleton className="h-14" />
            <LoadingSkeleton className="h-14" />
            <LoadingSkeleton className="h-14" />
          </div>
        ) : (
          <>
            <div className="overflow-auto">
              <table className="w-full min-w-[880px] text-left text-sm text-slate-200">
                <thead className="text-xs uppercase tracking-wide text-slate-300">
                  <tr>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Employee</th>
                    <th className="px-3 py-2">Department</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Check In</th>
                    <th className="px-3 py-2">Check Out</th>
                    <th className="px-3 py-2">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((record) => (
                    <tr
                      key={record.id}
                      className="cursor-pointer border-t border-white/10 transition hover:bg-white/5"
                      onClick={() => setSelectedRecord(record)}
                    >
                      <td className="px-3 py-3">{formatDate(record.attendanceDate)}</td>
                      <td className="px-3 py-3">{record.employee?.name}</td>
                      <td className="px-3 py-3">{record.employee?.department}</td>
                      <td className="px-3 py-3">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="px-3 py-3">{formatDateTime(record.checkInTime)}</td>
                      <td className="px-3 py-3">{formatDateTime(record.checkOutTime)}</td>
                      <td className="px-3 py-3">{record.totalHours}</td>
                    </tr>
                  ))}
                  {reports.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-slate-300">
                        No records found for selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
              <p>
                Page {pagination?.page || 1} of {pagination?.totalPages || 1}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-white/20 px-3 py-1 disabled:opacity-40"
                  disabled={!pagination?.page || pagination.page <= 1}
                  onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                >
                  Prev
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-white/20 px-3 py-1 disabled:opacity-40"
                  disabled={!pagination?.page || pagination.page >= pagination.totalPages}
                  onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {selectedRecord && (
        <div className="app-overlay fixed inset-0 z-50 grid place-items-center bg-brand-950/70 p-4 backdrop-blur-sm">
          <div className="glass-card w-full max-w-xl p-6">
            <div className="flex items-start justify-between">
              <h3 className="font-display text-xl text-white">Attendance Details</h3>
              <button
                type="button"
                className="rounded-lg border border-white/20 px-3 py-1 text-sm text-slate-200"
                onClick={() => setSelectedRecord(null)}
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
              <p>
                Employee: <span className="text-white">{selectedRecord.employee?.name}</span>
              </p>
              <p>
                Code: <span className="text-white">{selectedRecord.employee?.employeeCode}</span>
              </p>
              <p>
                Department: <span className="text-white">{selectedRecord.employee?.department}</span>
              </p>
              <p>
                Date: <span className="text-white">{formatDate(selectedRecord.attendanceDate)}</span>
              </p>
              <p>
                Check In: <span className="text-white">{formatDateTime(selectedRecord.checkInTime)}</span>
              </p>
              <p>
                Check Out: <span className="text-white">{formatDateTime(selectedRecord.checkOutTime)}</span>
              </p>
              <p>
                Total Hours: <span className="text-white">{selectedRecord.totalHours}</span>
              </p>
              <p>
                Status: <StatusBadge status={selectedRecord.status} />
              </p>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default ReportsPage;
