import { useAuthStore } from '../store/authStore';
import authService from '../services/auth.service';
import driverPortalService from '../services/driverPortal.service';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { isPublicCustomerPage } from '../utils/publicAccess';

const isDriverUser = (user) =>
  Boolean(user?.is_driver || user?.role_code === 'driver' || user?.driver_id);

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const permissions = useAuthStore((s) => s.permissions);
  const setAuth = useAuthStore((s) => s.setAuth);
  const storeLogout = useAuthStore((s) => s.logout);
  const clearSession = useAuthStore((s) => s.clearSession);
  const updateUser = useAuthStore((s) => s.updateUser);

  const login = useCallback(
    async (credentials) => {
      let payload;
      try {
        const { data } = await authService.login({
          email: credentials.email,
          password: credentials.password,
          rememberMe: true,
        });
        payload = data?.data || data;
      } catch (err) {
        // Demo fallback when API is unavailable (local UI preview)
        if (import.meta.env.VITE_DEMO_MODE === 'true' && !err.response) {
          payload = {
            accessToken: 'demo-access-token',
            refreshToken: 'demo-refresh-token',
            user: {
              id: 1,
              name: 'Admin User',
              email: credentials.email,
              role: 'Admin',
              permissions: ['*'],
            },
          };
        } else {
          throw err;
        }
      }

      const nextUser = {
        ...(payload.user || {}),
        permissions: payload.user?.permissions || payload.permissions || [],
      };

      // Persist in localStorage so View Quotation/Invoice/Receipt work in new tabs
      setAuth({
        user: nextUser,
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        rememberMe: true,
      });
      enqueueSnackbar('Welcome back!', { variant: 'success' });
      navigate(isDriverUser(nextUser) ? '/driver/trips' : '/dashboard');
      return payload;
    },
    [setAuth, enqueueSnackbar, navigate]
  );

  const loginDriver = useCallback(
    async (credentials, options = {}) => {
      const { data } = await driverPortalService.login({
        login: credentials.login,
        password: credentials.password,
        rememberMe: true,
      });
      const payload = data?.data || data;
      const nextUser = {
        ...(payload.user || {}),
        permissions: payload.user?.permissions || payload.permissions || [],
        is_driver: true,
      };

      setAuth({
        user: nextUser,
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        rememberMe: true,
      });
      enqueueSnackbar(`Welcome, ${nextUser.driver?.full_name || nextUser.name || 'Driver'}!`, {
        variant: 'success',
      });

      let redirectTo = options.redirectTo || '/driver/trips';
      try {
        if (options.tripId) {
          redirectTo = `/driver/trips/${options.tripId}`;
        } else if (options.shareCode) {
          const tripRes = await driverPortalService.getTripByShareCode(options.shareCode);
          const trip = tripRes.data?.data || tripRes.data;
          if (trip?.id) redirectTo = `/driver/trips/${trip.id}`;
          else redirectTo = `/driver/trips?c=${encodeURIComponent(options.shareCode)}`;
        } else if (options.enquiry) {
          const tripRes = await driverPortalService.getTripByEnquiry(options.enquiry);
          const trip = tripRes.data?.data || tripRes.data;
          if (trip?.id) redirectTo = `/driver/trips/${trip.id}`;
          else redirectTo = `/driver/trips?enquiry=${encodeURIComponent(options.enquiry)}`;
        }
      } catch {
        if (options.shareCode) {
          redirectTo = `/driver/trips?c=${encodeURIComponent(options.shareCode)}`;
        } else if (options.enquiry) {
          redirectTo = `/driver/trips?enquiry=${encodeURIComponent(options.enquiry)}`;
        }
      }

      navigate(redirectTo);
      return payload;
    },
    [setAuth, enqueueSnackbar, navigate]
  );

  const logout = useCallback(
    async (redirectTo) => {
      const wasDriver = isDriverUser(useAuthStore.getState().user);
      try {
        await authService.logout();
      } catch {
        // ignore logout API errors
      } finally {
        storeLogout();
        queryClient.clear();
        navigate(redirectTo || (wasDriver ? '/driver/login' : '/login'));
      }
    },
    [storeLogout, queryClient, navigate]
  );

  const expireSession = useCallback(async () => {
    if (isPublicCustomerPage()) {
      return;
    }

    const wasDriver = isDriverUser(useAuthStore.getState().user);
    try {
      await authService.logout({ reason: 'timeout' });
    } catch {
      // still clear the local session if the API is unreachable
    } finally {
      clearSession();
      queryClient.clear();
      enqueueSnackbar('You were logged out after 20 minutes of inactivity.', { variant: 'warning' });
      navigate(wasDriver || window.location.pathname.startsWith('/driver') ? '/driver/login' : '/login');
    }
  }, [clearSession, queryClient, enqueueSnackbar, navigate]);

  return {
    user,
    accessToken,
    isAuthenticated,
    permissions,
    isDriver: isDriverUser(user),
    login,
    loginDriver,
    logout,
    expireSession,
    updateUser,
  };
};

export default useAuth;
