import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { hasPermission } from '../utils/permissions';
import Loader from '../components/common/Loader';

const isDriverUser = (user) =>
  Boolean(user?.is_driver || user?.role_code === 'driver' || user?.driver_id);

export default function ProtectedRoute({ permission }) {
  const location = useLocation();
  const { isAuthenticated, permissions, accessToken, user } = useAuthStore();

  if (!isAuthenticated || !accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (isDriverUser(user)) {
    return <Navigate to="/driver/trips" replace />;
  }

  if (permission && !hasPermission(permissions, permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

export function AuthLoadingGate({ children, loading }) {
  if (loading) return <Loader fullScreen message="Checking session..." />;
  return children;
}
