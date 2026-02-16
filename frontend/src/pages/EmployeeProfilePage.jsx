import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import AppLayout from '../components/layout/AppLayout';
import { formatDate, toTitleCase } from '../utils/format';

const ProfileField = ({ label, value }) => (
  <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
    <p className="text-xs uppercase tracking-[0.18em] text-slate-300">{label}</p>
    <p className="mt-2 text-base font-semibold text-white">{value || '-'}</p>
  </div>
);

const EmployeeProfilePage = () => {
  const user = useSelector((state) => state.auth.user);

  const initials = useMemo(() => {
    const safeName = String(user?.name || 'U').trim();
    const parts = safeName.split(/\s+/).filter(Boolean);
    if (!parts.length) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }, [user?.name]);

  return (
    <AppLayout role={user?.role}>
      <section className="glass-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-5">
          <div className="grid h-20 w-20 place-items-center rounded-3xl bg-button-gradient text-2xl font-bold text-white shadow-glow">
            {initials}
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-white">{user?.name || 'Employee'}</h2>
            <p className="mt-1 text-sm text-slate-300">Manage your account and view profile details.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <ProfileField label="Employee Code" value={user?.employeeCode} />
          <ProfileField label="Role" value={toTitleCase(user?.role)} />
          <ProfileField label="Department" value={user?.department} />
          <ProfileField label="Email" value={user?.email} />
          <ProfileField label="Member Since" value={formatDate(user?.createdAt)} />
          <ProfileField label="Account Status" value="Active" />
        </div>
      </section>
    </AppLayout>
  );
};

export default EmployeeProfilePage;
