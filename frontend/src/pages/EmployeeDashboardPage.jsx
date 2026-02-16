import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import AppLayout from '../components/layout/AppLayout';
import StatusBadge from '../components/ui/StatusBadge';
import StatCard from '../components/ui/StatCard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { EmployeeActivityChart } from '../components/ui/Charts';
import { fetchEmployeeDashboard, performCheckIn, performCheckOut } from '../features/attendance/attendanceSlice';
import { formatTime } from '../utils/format';

const EmployeeDashboardPage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { today, summary } = useSelector((state) => state.attendance.employee);
  const { employeeDashboard, checkAction } = useSelector((state) => state.attendance.loading);

  useEffect(() => {
    dispatch(fetchEmployeeDashboard());
  }, [dispatch]);

  const canCheckout = Boolean(today?.checkInTime && !today?.checkOutTime);
  const canCheckin = !today || (!today?.checkInTime && !today?.checkOutTime);

  const activityData = useMemo(
    () =>
      (summary?.last7DaysActivity || []).map((row) => ({
        ...row,
        date: row.date.slice(5),
        totalHours: Number(row.totalHours)
      })),
    [summary]
  );

  const runCheckin = async () => {
    await dispatch(performCheckIn());
    await dispatch(fetchEmployeeDashboard());
  };

  const runCheckout = async () => {
    await dispatch(performCheckOut());
    await dispatch(fetchEmployeeDashboard());
  };

  return (
    <AppLayout role={user?.role}>
      {employeeDashboard ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <LoadingSkeleton className="h-36" />
          <LoadingSkeleton className="h-36" />
          <LoadingSkeleton className="h-36" />
          <LoadingSkeleton className="h-36" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Today Status"
              value={today?.status === 'half-day' ? 0.5 : today?.status === 'present' || today?.status === 'late' ? 1 : 0}
              hint={today?.status ? today.status.toUpperCase() : 'Not Marked'}
              icon="?"
            />
            <StatCard title="Present (Month)" value={summary?.statusSummary?.present || 0} hint="Includes full day entries" icon="?" />
            <StatCard title="Late (Month)" value={summary?.statusSummary?.late || 0} hint="After 9:30 AM" icon="?" />
            <StatCard title="Total Hours" value={summary?.totalHours || 0} hint="Current month" icon="?" />
          </div>

          <section className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="glass-card space-y-4 p-6">
              <h2 className="font-display text-lg text-white">Quick Check In / Out</h2>
              <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                <p className="text-sm text-slate-300">Current attendance snapshot</p>
                <div className="mt-2">{today?.status ? <StatusBadge status={today.status} /> : <StatusBadge status="absent" />}</div>
                <div className="mt-4 grid gap-3 text-sm text-slate-200">
                  <p>
                    Check In: <span className="text-white">{formatTime(today?.checkInTime)}</span>
                  </p>
                  <p>
                    Check Out: <span className="text-white">{formatTime(today?.checkOutTime)}</span>
                  </p>
                  <p>
                    Total Hours: <span className="text-white">{today?.totalHours || 0}</span>
                  </p>
                </div>
              </div>

              {canCheckin && (
                <button className="btn-gradient w-full" type="button" onClick={runCheckin} disabled={checkAction}>
                  {checkAction ? 'Processing...' : 'Check In'}
                </button>
              )}

              {canCheckout && (
                <button className="btn-gradient w-full" type="button" onClick={runCheckout} disabled={checkAction}>
                  {checkAction ? 'Processing...' : 'Check Out'}
                </button>
              )}

              {!canCheckin && !canCheckout && <p className="text-sm text-slate-300">Today attendance is completed.</p>}
            </div>

            <div className="lg:col-span-2">
              <EmployeeActivityChart data={activityData} />
            </div>
          </section>
        </>
      )}
    </AppLayout>
  );
};

export default EmployeeDashboardPage;