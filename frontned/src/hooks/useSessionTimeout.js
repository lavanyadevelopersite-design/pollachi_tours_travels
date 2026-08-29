import { useCallback, useEffect, useRef } from 'react';
import { SESSION_TIMEOUT_MINUTES } from '../utils/constants';
import { useAuth } from './useAuth';
import authService from '../services/auth.service';

const EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
const HEARTBEAT_MIN_INTERVAL_MS = 2 * 60 * 1000;

export const useSessionTimeout = (timeoutMinutes = SESSION_TIMEOUT_MINUTES) => {
  const { isAuthenticated, expireSession } = useAuth();
  const timerRef = useRef(null);
  const lastHeartbeatRef = useRef(0);

  const pingSession = useCallback(() => {
    if (!isAuthenticated) return;
    const now = Date.now();
    if (now - lastHeartbeatRef.current < HEARTBEAT_MIN_INTERVAL_MS) return;
    lastHeartbeatRef.current = now;
    authService.me().catch(() => {});
  }, [isAuthenticated]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!isAuthenticated) return;
    pingSession();
    timerRef.current = setTimeout(
      () => expireSession(),
      timeoutMinutes * 60 * 1000
    );
  }, [isAuthenticated, expireSession, timeoutMinutes, pingSession]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    pingSession();
    resetTimer();
    EVENTS.forEach((event) => window.addEventListener(event, resetTimer));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      EVENTS.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [isAuthenticated, resetTimer, pingSession]);
};

export default useSessionTimeout;
