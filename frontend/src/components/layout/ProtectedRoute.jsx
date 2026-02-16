import { Navigate, Outlet } from 'react-router-dom';

import useAuth from '../../hooks/useAuth';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, token, initialized } = useAuth();

  if (!initialized && token) {
    return (
      <div className="grid min-h-screen place-items-center bg-brand-gradient text-white">
        <p className="animate-pulse text-lg">Loading session...</p>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard'} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;