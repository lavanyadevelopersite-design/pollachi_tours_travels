import { create } from 'zustand';
import { storage } from '../utils/storage';

const storedUser = storage.getUser();
const storedToken = storage.getToken();

export const useAuthStore = create((set, get) => ({
  user: storedUser,
  accessToken: storedToken,
  isAuthenticated: Boolean(storedToken && storedUser),
  permissions: storedUser?.permissions || [],

  setAuth: ({ user, accessToken, refreshToken, rememberMe }) => {
    storage.setAuth({ accessToken, refreshToken, user, rememberMe });
    set({
      user,
      accessToken,
      isAuthenticated: true,
      permissions: user?.permissions || [],
    });
  },

  updateUser: (user) => {
    storage.setAuth({
      accessToken: get().accessToken,
      refreshToken: storage.getRefreshToken(),
      user,
      rememberMe: true,
    });
    set({ user, permissions: user?.permissions || [] });
  },

  setTokens: ({ accessToken, refreshToken }) => {
    storage.updateTokens({ accessToken, refreshToken });
    set({ accessToken, isAuthenticated: true });
  },

  logout: () => {
    storage.clearAuth();
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      permissions: [],
    });
  },

  clearSession: () => {
    // Column visibility prefs are stored in DB per user; clear auth tokens only.
    storage.clearAuth();
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      permissions: [],
    });
  },
}));

export default useAuthStore;
