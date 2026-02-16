import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';

import AppLayout from '../components/layout/AppLayout';
import AttendanceCalendar from '../components/ui/AttendanceCalendar';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import StatusBadge from '../components/ui/StatusBadge';
import { fetchMyHistory } from '../features/attendance/attendanceSlice';
import { formatDate, formatDateTime, formatTime } from '../utils/format';

const AttendancePage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const history = useSelector((state) => state.attendance.employee.history);
  const pagination = useSelector((state) => state.attendance.employee.historyPagination);
  const loading = useSelector((state) => state.attendance.loading.history);

  const [filters, setFilters] = useState({
    month: dayjs().format('YYYY-MM'),
    from: dayjs().startOf('month').format('YYYY-MM-DD'),
    to: dayjs().format('YYYY-MM-DD'),
    page: 1,
    limit: 100
  });
  const [selectedDate, setSelectedDate] = useState('');

  const historyQuery = useMemo(
    () => ({
      from: filters.from,
      to: filters.to,
      page: filters.page,
      limit: filters.limit
    }),
    [filters.from, filters.to, filters.page, filters.limit]
  );

  useEffect(() => {
    dispatch(fetchMyHistory(historyQuery));
  }, [dispatch, historyQuery]);

  const calendarRecords = useMemo(
    () =>
      history.map((item) => ({
        id: item.id,
        attendanceDate: item.attendanceDate,
        status: item.status,
        checkInTime: item.checkInTime,
        checkOutTime: item.checkOutTime,
        totalHours: item.totalHours
      })),
    [history]
  );

  const recordByDate = useMemo(() => {
    const map = new Map();
    calendarRecords.forEach((record) => {
      map.set(record.attendanceDate, record);
    });
    return map;
  }, [calendarRecords]);

  const selectedRecord = selectedDate ? recordByDate.get(selectedDate) || null : null;

  return (
    <AppLayout role={user?.role}>
      <section className="glass-card animate-floatUp p-5">
        <div className="flex flex-wrap items-end gap-4">
          <label className="space-y-2 text-sm text-slate-200">
            <span>Month</span>
            <input
              type="month"
              className="input-control"
              value={filters.month}
              onChange={(event) => {
                const month = event.target.value;
                const start = dayjs(`${month}-01`).startOf('month').format('YYYY-MM-DD');
                const end = dayjs(`${month}-01`).endOf('month').format('YYYY-MM-DD');
                setFilters((prev) => ({
                  ...prev,
                  month,
                  from: start,
                  to: end,
                  page: 1
                }));
              }}
            />
          </label>
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
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  to: event.target.value,
                  page: 1
                }))
              }
            />
          </label>
          <button className="btn-gradient" type="button" onClick={() => dispatch(fetchMyHistory(historyQuery))}>
            Apply
          </button>
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <AttendanceCalendar records={calendarRecords} onDateClick={(date) => setSelectedDate(date)} />
        </div>

        <div className="glass-card xl:col-span-2 p-4">
          <h2 className="mb-4 font-display text-lg text-white">Attendance History</h2>
          {loading ? (
            <div className="space-y-3">
              <LoadingSkeleton className="h-14" />
              <LoadingSkeleton className="h-14" />
              <LoadingSkeleton className="h-14" />
            </div>
          ) : (
            <>
              <div className="max-h-[28rem] overflow-auto">
                <table className="w-full text-left text-sm text-slate-200">
                  <thead className="sticky top-0 bg-brand-900/95 text-xs uppercase tracking-wide text-slate-300">
                    <tr>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">In</th>
                      <th className="px-3 py-2">Out</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((record) => (
                      <tr key={record.id} className="border-b border-white/10">
                        <td className="px-3 py-3">{formatDate(record.attendanceDate)}</td>
                        <td className="px-3 py-3">
                          <StatusBadge status={record.status} />
                        </td>
                        <td className="px-3 py-3">{formatTime(record.checkInTime)}</td>
                        <td className="px-3 py-3">{formatTime(record.checkOutTime)}</td>
                      </tr>
                    ))}
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
        </div>
      </div>

      {selectedDate && (
        <div className="app-overlay fixed inset-0 z-50 grid place-items-center p-4 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-6">
            <div className="flex items-start justify-between">
              <h3 className="font-display text-xl text-white">Attendance Details</h3>
              <button
                type="button"
                className="rounded-lg border border-white/20 px-3 py-1 text-sm text-slate-200"
                onClick={() => setSelectedDate('')}
              >
                Close
              </button>
            </div>

            <p className="mt-3 text-sm text-slate-300">
              Date: <span className="text-white">{formatDate(selectedDate)}</span>
            </p>

            {selectedRecord ? (
              <div className="mt-5 grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
                <p>
                  Status: <StatusBadge status={selectedRecord.status} />
                </p>
                <p>
                  Total Hours: <span className="text-white">{selectedRecord.totalHours || 0}</span>
                </p>
                <p>
                  Check In: <span className="text-white">{formatDateTime(selectedRecord.checkInTime)}</span>
                </p>
                <p>
                  Check Out: <span className="text-white">{formatDateTime(selectedRecord.checkOutTime)}</span>
                </p>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-slate-200">
                No attendance record found for this date.
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default AttendancePage;
