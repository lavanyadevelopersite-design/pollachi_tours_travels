import axios from 'axios';
import { API_URL } from '../utils/constants';
import { storage } from '../utils/storage';
import { useAuthStore } from '../store/authStore';
import { isPublicCustomerPage, shouldSkipSessionForRequest } from '../utils/publicAccess';

let isRefreshing = false;
let failedQueue = [];
let queryClientRef = null;
let snackbarRef = null;

export const setApiHelpers = ({ queryClient, enqueueSnackbar }) => {
  queryClientRef = queryClient;
  snackbarRef = enqueueSnackbar;
};

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const handleSessionExpired = () => {
  if (isPublicCustomerPage()) {
    return;
  }

  const user = useAuthStore.getState().user;
  const isDriverPath = window.location.pathname.startsWith('/driver');
  const isDriver =
    isDriverPath ||
    user?.is_driver ||
    user?.role_code === 'driver' ||
    Boolean(user?.driver_id);

  useAuthStore.getState().clearSession();
  if (queryClientRef) queryClientRef.clear();
  if (snackbarRef) {
    snackbarRef('Your session has expired. Please login again.', { variant: 'warning' });
  }
  const target = isDriver ? '/driver/login' : '/login';
  if (window.location.pathname !== target) {
    window.location.href = target;
  }
};

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const url = String(config.url || '');
    if (shouldSkipSessionForRequest(url)) {
      if (config.headers) {
        delete config.headers.Authorization;
        delete config.headers.authorization;
      }
      return config;
    }

    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const requestUrl = String(originalRequest.url || '');
    if (shouldSkipSessionForRequest(requestUrl)) {
      return Promise.reject(error);
    }

    // Demo mode: never wipe the session for preview tokens
    if (
      import.meta.env.VITE_DEMO_MODE === 'true' &&
      storage.getToken() === 'demo-access-token'
    ) {
      return Promise.reject(error);
    }

    if (requestUrl.includes('/auth/login') || requestUrl.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = storage.getRefreshToken();
    if (!refreshToken) {
      isRefreshing = false;
      handleSessionExpired();
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
      const newAccess = data?.data?.accessToken || data?.accessToken;
      const newRefresh = data?.data?.refreshToken || data?.refreshToken || refreshToken;

      useAuthStore.getState().setTokens({ accessToken: newAccess, refreshToken: newRefresh });
      processQueue(null, newAccess);
      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      handleSessionExpired();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
