import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const isDriverUser = (user) =>
  Boolean(user?.is_driver || user?.role_code === 'driver' || user?.driver_id);

export default function GuestRoute({ children, driverOnly = false }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const { code } = useParams();
  const [searchParams] = useSearchParams();

  if (isAuthenticated) {
    if (isDriverUser(user)) {
      const trip = searchParams.get('trip');
      const enquiry = searchParams.get('enquiry');
      if (code) {
        return <Navigate to={`/driver/trips?c=${encodeURIComponent(code)}`} replace />;
      }
      if (trip) return <Navigate to={`/driver/trips/${trip}`} replace />;
      if (enquiry) {
        return (
          <Navigate
            to={`/driver/trips?enquiry=${encodeURIComponent(enquiry)}`}
            replace
          />
        );
      }
      return <Navigate to="/driver/trips" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
