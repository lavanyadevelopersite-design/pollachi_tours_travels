import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const isDriverUser = (user) =>
  Boolean(user?.is_driver || user?.role_code === 'driver' || user?.driver_id);

export default function DriverRoute() {
  const location = useLocation();
  const { isAuthenticated, accessToken, user } = useAuthStore();

  if (!isAuthenticated || !accessToken) {
    return <Navigate to="/driver/login" replace state={{ from: location }} />;
  }

  if (!isDriverUser(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
