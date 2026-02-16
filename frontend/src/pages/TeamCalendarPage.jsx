import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useSelector } from 'react-redux';

import AppLayout from '../components/layout/AppLayout';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import StatusBadge from '../components/ui/StatusBadge';
import { allAttendanceApi, departmentsApi, employeesApi } from '../services/attendance.api';
import { formatDate, formatDateTime, getStatusEventColor, toTitleCase } from '../utils/format';

const TeamCalendarPage = () => {
  const user = useSelector((state) => state.auth.user);

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [records, setRecords] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [error, setError] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filters, setFilters] = useState({
    month: dayjs().format('YYYY-MM'),
    employeeId: '',
    department: ''
  });

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setLoadingMeta(true);
      setError('');

      try {
        const [employeeData, departmentData] = await Promise.all([employeesApi(), departmentsApi()]);
        if (!mounted) return;
        setEmployees(employeeData);
        setDepartments(departmentData);
      } catch (requestError) {
        if (!mounted) return;
        setError(requestError?.response?.data?.message || 'Failed to load team filter options');
      } finally {
        if (mounted) {
          setLoadingMeta(false);
        }
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setLoadingRecords(true);
      setError('');

      try {
        const monthStart = dayjs(`${filters.month}-01`).startOf('month').format('YYYY-MM-DD');
        const monthEnd = dayjs(`${filters.month}-01`).endOf('month').format('YYYY-MM-DD');

        const params = {
          from: monthStart,
          to: monthEnd,
          page: 1,
          limit: 1000
        };

        if (filters.employeeId) {
          params.employeeId = filters.employeeId;
        }

        if (filters.department) {
          params.department = filters.department;
        }

        const data = await allAttendanceApi(params);
        if (!mounted) return;
        setRecords(data.records || []);
      } catch (requestError) {
        if (!mounted) return;
        setError(requestError?.response?.data?.message || 'Failed to load team calendar attendance');
        setRecords([]);
      } finally {
        if (mounted) {
          setLoadingRecords(false);
        }
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [filters.month, filters.employeeId, filters.department]);

  const events = useMemo(
    () =>
      records.map((record) => {
        const color = getStatusEventColor(record.status);
        return {
          id: String(record.id),
          title: `${record.employee?.name || 'Employee'} - ${toTitleCase(record.status)}`,
          date: record.attendanceDate,
          backgroundColor: color,
          borderColor: color,
          textColor: record.status === 'late' || record.status === 'half-day' ? '#0f172a' : '#ffffff',
          extendedProps: {
            attendance: record
          }
        };
      }),
    [records]
  );

  const onCalendarMonthChange = (info) => {
    const nextMonth = dayjs(info.view.currentStart).format('YYYY-MM');
    setFilters((prev) => (prev.month === nextMonth ? prev : { ...prev, month: nextMonth }));
  };

  return (
    <AppLayout role={user?.role}>
      <section className="glass-card p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2 text-sm text-slate-200">
            <span>Month</span>
            <input
              type="month"
              className="input-control"
              value={filters.month}
              onChange={(event) => setFilters((prev) => ({ ...prev, month: event.target.value }))}
            />
          </label>

          <label className="space-y-2 text-sm text-slate-200">
            <span>Department</span>
            <select
              className="input-control"
              value={filters.department}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  department: event.target.value,
                  employeeId: ''
                }))
              }
              disabled={loadingMeta}
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
            <span>Employee</span>
            <select
              className="input-control"
              value={filters.employeeId}
              onChange={(event) => setFilters((prev) => ({ ...prev, employeeId: event.target.value }))}
              disabled={loadingMeta}
            >
              <option value="">All Employees</option>
              {employees
                .filter((employee) => !filters.department || employee.department === filters.department)
                .map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
            </select>
          </label>
        </div>
      </section>

      {error && <p className="mt-4 rounded-xl border border-rose-400/40 bg-rose-500/15 px-4 py-3 text-sm text-rose-200">{error}</p>}

      <section className="glass-card mt-6 p-4">
        {loadingRecords ? (
          <div className="space-y-3">
            <LoadingSkeleton className="h-14" />
            <LoadingSkeleton className="h-14" />
            <LoadingSkeleton className="h-14" />
            <LoadingSkeleton className="h-14" />
          </div>
        ) : (
          <FullCalendar
            key={filters.month}
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            initialDate={`${filters.month}-01`}
            events={events}
            datesSet={onCalendarMonthChange}
            eventClick={(clickInfo) => setSelectedRecord(clickInfo.event.extendedProps.attendance)}
            height="auto"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: ''
            }}
          />
        )}
      </section>

      {selectedRecord && (
        <div className="app-overlay fixed inset-0 z-50 grid place-items-center p-4 backdrop-blur-sm">
          <div className="glass-card w-full max-w-xl p-6">
            <div className="flex items-start justify-between">
              <h3 className="font-display text-xl text-white">Team Attendance Details</h3>
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
                Employee: <span className="text-white">{selectedRecord.employee?.name || '-'}</span>
              </p>
              <p>
                Code: <span className="text-white">{selectedRecord.employee?.employeeCode || '-'}</span>
              </p>
              <p>
                Department: <span className="text-white">{selectedRecord.employee?.department || '-'}</span>
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

export default TeamCalendarPage;
