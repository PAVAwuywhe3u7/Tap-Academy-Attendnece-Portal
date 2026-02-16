import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { logout } from '../../features/auth/authSlice';
import { applyTheme, getStoredTheme, THEME_BLUE, THEME_LIGHT } from '../../utils/theme';

const SunIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="4.25" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M12 2.75v2.5M12 18.75v2.5M21.25 12h-2.5M5.25 12h-2.5M18.54 5.46l-1.77 1.77M7.23 16.77l-1.77 1.77M18.54 18.54l-1.77-1.77M7.23 7.23 5.46 5.46"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const MoonIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M21 13.02A8.98 8.98 0 0 1 11.44 22 9 9 0 0 1 7.2 5.06a.65.65 0 0 1 .8.8 7.2 7.2 0 0 0 9.14 9.14.65.65 0 0 1 .8.8A8.94 8.94 0 0 1 21 13.02Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TITLES = {
  '/employee/dashboard': 'Employee Dashboard',
  '/employee/attendance': 'My Attendance',
  '/employee/profile': 'My Profile',
  '/manager/dashboard': 'Manager Dashboard',
  '/manager/calendar': 'Team Calendar',
  '/manager/reports': 'Attendance Reports'
};

const Topbar = ({ onMenuToggle }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);

  const [theme, setTheme] = useState(() => getStoredTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const isLight = theme === THEME_LIGHT;

  const title = TITLES[location.pathname] || 'Attendance';

  return (
    <header className="app-topbar sticky top-0 z-20 border-b border-white/10 bg-brand-950/60 px-4 py-4 backdrop-blur-xl sm:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-xl border border-white/20 px-3 py-2 text-sm text-slate-100 lg:hidden"
            onClick={onMenuToggle}
          >
            Menu
          </button>
          <div>
            <h1 className="font-display text-xl font-semibold text-white sm:text-2xl">{title}</h1>
            <p className="text-sm text-slate-300">Track consistency, productivity, and attendance quality.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="theme-icon-toggle"
            onClick={() => setTheme((prev) => (prev === THEME_LIGHT ? THEME_BLUE : THEME_LIGHT))}
            aria-label={`Switch to ${isLight ? 'blue' : 'light'} mode`}
            title={isLight ? 'Switch to Blue mode' : 'Switch to Light mode'}
          >
            <span className={`theme-icon-track ${isLight ? 'is-light' : 'is-blue'}`}>
              <SunIcon className="theme-icon-static theme-icon-static-sun" />
              <MoonIcon className="theme-icon-static theme-icon-static-moon" />
              <span className="theme-icon-knob">
                {isLight ? <SunIcon className="theme-icon-active" /> : <MoonIcon className="theme-icon-active" />}
              </span>
            </span>
          </button>
          <div className="hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-right sm:block">
            <p className="text-sm font-semibold text-white">{user?.name || 'User'}</p>
            <p className="text-xs uppercase tracking-wider text-slate-300">{user?.role}</p>
          </div>
          <button
            type="button"
            className="rounded-xl bg-button-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02]"
            onClick={() => dispatch(logout())}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
