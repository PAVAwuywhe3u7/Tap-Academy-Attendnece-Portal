import { NavLink } from 'react-router-dom';
import tapAcademyLogo from '../../assets/new logo.jpg';

const linkClass = ({ isActive }) =>
  `nav-link ${isActive ? 'is-active shadow-glow' : ''}`;

const Sidebar = ({ role, open, onClose }) => {
  const menu =
    role === 'manager'
      ? [
          { label: 'Dashboard', to: '/manager/dashboard' },
          { label: 'Team Calendar', to: '/manager/calendar' },
          { label: 'Reports', to: '/manager/reports' }
        ]
      : [
          { label: 'Dashboard', to: '/employee/dashboard' },
          { label: 'Attendance', to: '/employee/attendance' },
          { label: 'Profile', to: '/employee/profile' }
        ];

  return (
    <aside
      className={`app-sidebar fixed inset-y-0 left-0 z-40 w-72 border-r border-white/10 bg-brand-900/80 px-5 pb-8 pt-6 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-xl border border-white/20 bg-white/10 p-0.5">
            <img src={tapAcademyLogo} alt="Tap Academy" className="h-full w-full rounded-[0.6rem] object-cover" />
          </div>
          <div>
            <p className="sidebar-brand-title font-display text-xl font-semibold">Tap Academy</p>
            <p className="sidebar-brand-subtitle text-xs tracking-[0.2em]">EMPLOYEE ATTENDANCE</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg border border-white/20 px-2 py-1 text-xs lg:hidden"
          type="button"
        >
          Close
        </button>
      </div>

      <nav className="mt-10 space-y-2">
        {menu.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClass} onClick={onClose}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
