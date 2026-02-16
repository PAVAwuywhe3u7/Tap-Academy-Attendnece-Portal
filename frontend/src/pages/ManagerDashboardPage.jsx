import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import AppLayout from '../components/layout/AppLayout';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import StatCard from '../components/ui/StatCard';
import { DepartmentPieChart, WeeklyTrendChart } from '../components/ui/Charts';
import { fetchFiltersMeta, fetchManagerDashboard } from '../features/attendance/attendanceSlice';

const ManagerDashboardPage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const summary = useSelector((state) => state.attendance.manager.summary);
  const todayStatus = useSelector((state) => state.attendance.manager.todayStatus);
  const departments = useSelector((state) => state.attendance.manager.departments);
  const loading = useSelector((state) => state.attendance.loading.managerDashboard);

  const [department, setDepartment] = useState('');

  useEffect(() => {
    dispatch(fetchManagerDashboard(department ? { department } : {}));
    dispatch(fetchFiltersMeta());
  }, [dispatch, department]);

  return (
    <AppLayout role={user?.role}>
      <div className="mb-6 flex items-center gap-3">
        <label className="text-sm text-slate-300">Department</label>
        <select
          className="input-control max-w-xs"
          value={department}
          onChange={(event) => setDepartment(event.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <LoadingSkeleton className="h-36" />
          <LoadingSkeleton className="h-36" />
          <LoadingSkeleton className="h-36" />
          <LoadingSkeleton className="h-36" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Employees" value={summary?.stats?.totalEmployees || 0} hint="Active employees" icon="??" />
            <StatCard title="Present Today" value={todayStatus?.breakdown?.present || 0} hint="On-time check-ins" icon="?" />
            <StatCard title="Late Arrivals" value={summary?.stats?.lateArrivals || 0} hint="After 9:30 AM" icon="?" />
            <StatCard title="Absent Today" value={todayStatus?.breakdown?.absent || 0} hint="No check-in yet" icon="?" />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <WeeklyTrendChart data={summary?.weeklyTrend || []} />
            <DepartmentPieChart data={summary?.departmentWise || []} />
          </div>

          <section className="glass-card mt-6 p-5">
            <h2 className="mb-4 font-display text-lg text-white">Absent Employees</h2>
            <div className="overflow-auto">
              <table className="w-full text-left text-sm text-slate-200">
                <thead className="text-xs uppercase tracking-wide text-slate-300">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Employee Code</th>
                    <th className="px-3 py-2">Department</th>
                  </tr>
                </thead>
                <tbody>
                  {(todayStatus?.absentEmployees || []).map((employee) => (
                    <tr key={employee.id} className="border-t border-white/10">
                      <td className="px-3 py-3">{employee.name}</td>
                      <td className="px-3 py-3">{employee.employeeCode}</td>
                      <td className="px-3 py-3">{employee.department}</td>
                    </tr>
                  ))}
                  {(!todayStatus?.absentEmployees || todayStatus.absentEmployees.length === 0) && (
                    <tr>
                      <td colSpan={3} className="px-3 py-6 text-center text-slate-300">
                        No absent employees for current filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </AppLayout>
  );
};

export default ManagerDashboardPage;