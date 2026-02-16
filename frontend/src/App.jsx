import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import ProtectedRoute from './components/layout/ProtectedRoute';
import { fetchMe } from './features/auth/authSlice';
import AttendancePage from './pages/AttendancePage';
import EmployeeDashboardPage from './pages/EmployeeDashboardPage';
import EmployeeProfilePage from './pages/EmployeeProfilePage';
import LoginPage from './pages/LoginPage';
import ManagerDashboardPage from './pages/ManagerDashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import RegisterPage from './pages/RegisterPage';
import ReportsPage from './pages/ReportsPage';
import TeamCalendarPage from './pages/TeamCalendarPage';

const HomeRedirect = () => {
  const { token, user } = useSelector((state) => state.auth);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard'} replace />;
};

const PublicOnly = ({ children }) => {
  const { token, user } = useSelector((state) => state.auth);

  if (token && user) {
    return <Navigate to={user.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard'} replace />;
  }

  return children;
};

const App = () => {
  const dispatch = useDispatch();
  const { token, initialized } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchMe());
    }
  }, [dispatch, token]);

  if (token && !initialized) {
    return (
      <div className="grid min-h-screen place-items-center bg-brand-gradient text-white">
        <p className="animate-pulse text-lg">Bootstrapping secure session...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnly>
            <LoginPage />
          </PublicOnly>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnly>
            <RegisterPage />
          </PublicOnly>
        }
      />

      <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
        <Route path="/employee/dashboard" element={<EmployeeDashboardPage />} />
        <Route path="/employee/attendance" element={<AttendancePage />} />
        <Route path="/employee/profile" element={<EmployeeProfilePage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
        <Route path="/manager/dashboard" element={<ManagerDashboardPage />} />
        <Route path="/manager/reports" element={<ReportsPage />} />
        <Route path="/manager/calendar" element={<TeamCalendarPage />} />
      </Route>

      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
