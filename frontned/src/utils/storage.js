import { STORAGE_KEYS } from './constants';

/**
 * Auth always uses localStorage so new tabs (View Quotation / Invoice / Receipt)
 * share the same session. sessionStorage is tab-isolated and caused login redirects.
 */
const authStore = () => localStorage;

const migrateSessionAuthToLocal = () => {
  const keys = [STORAGE_KEYS.ACCESS_TOKEN, STORAGE_KEYS.REFRESH_TOKEN, STORAGE_KEYS.USER];
  keys.forEach((key) => {
    const fromSession = sessionStorage.getItem(key);
    if (fromSession && !localStorage.getItem(key)) {
      localStorage.setItem(key, fromSession);
    }
    sessionStorage.removeItem(key);
  });
  if (!localStorage.getItem(STORAGE_KEYS.REMEMBER_ME)) {
    localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
  }
};

// Run once on module load so an existing tab session works in newly opened tabs
migrateSessionAuthToLocal();

export const storage = {
  getToken() {
    migrateSessionAuthToLocal();
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  getRefreshToken() {
    migrateSessionAuthToLocal();
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  getUser() {
    migrateSessionAuthToLocal();
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setAuth({ accessToken, refreshToken, user }) {
    const store = authStore();
    sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.USER);

    store.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) store.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    if (user) store.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
  },

  updateTokens({ accessToken, refreshToken }) {
    const store = authStore();
    if (accessToken) store.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) store.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  },

  clearAuth() {
    [localStorage, sessionStorage].forEach((store) => {
      store.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      store.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      store.removeItem(STORAGE_KEYS.USER);
    });
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
  },

  clearAll() {
    localStorage.clear();
    sessionStorage.clear();
  },

  getItem(key, fromLocal = true) {
    return (fromLocal ? localStorage : sessionStorage).getItem(key);
  },

  setItem(key, value, toLocal = true) {
    (toLocal ? localStorage : sessionStorage).setItem(key, value);
  },
};

export default storage;
