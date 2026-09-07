import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { SESSION_TIMEOUT_MINUTES } from '../utils/constants';
import { isEnquirySessionExemptPage } from '../utils/publicAccess';
import { useAuth } from './useAuth';
import authService from '../services/auth.service';

const EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
const HEARTBEAT_MIN_INTERVAL_MS = 2 * 60 * 1000;

export const useSessionTimeout = (timeoutMinutes = SESSION_TIMEOUT_MINUTES) => {
  const location = useLocation();
  const { isAuthenticated, expireSession } = useAuth();
  const timerRef = useRef(null);
  const lastHeartbeatRef = useRef(0);
  const skipIdleLogout = isEnquirySessionExemptPage(location.pathname);

  const pingSession = useCallback(() => {
    if (!isAuthenticated || skipIdleLogout) return;
    const now = Date.now();
    if (now - lastHeartbeatRef.current < HEARTBEAT_MIN_INTERVAL_MS) return;
    lastHeartbeatRef.current = now;
    authService.me().catch(() => {});
  }, [isAuthenticated, skipIdleLogout]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!isAuthenticated || skipIdleLogout) return;
    pingSession();
    timerRef.current = setTimeout(() => expireSession(), timeoutMinutes * 60 * 1000);
  }, [isAuthenticated, skipIdleLogout, expireSession, timeoutMinutes, pingSession]);

  useEffect(() => {
    if (!isAuthenticated || skipIdleLogout) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return undefined;
    }

    pingSession();
    resetTimer();
    EVENTS.forEach((event) => window.addEventListener(event, resetTimer));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      EVENTS.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [isAuthenticated, skipIdleLogout, resetTimer, pingSession]);
};

export default useSessionTimeout;
