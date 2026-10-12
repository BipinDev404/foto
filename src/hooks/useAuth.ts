/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { UserRole, GalleryConfig } from '../types/gallery';
import { authenticateWithSinglePassword, signOutUser } from '../lib/supabase';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 1 minute
const LOCKOUT_KEY = 'foto_auth_lockout_until';
const ATTEMPTS_KEY = 'foto_auth_failed_attempts';
const SESSION_ROLE_KEY = 'foto_current_session_role';

export function useAuth(config: GalleryConfig) {
  const [role, setRole] = useState<UserRole | null>(() => {
    return (sessionStorage.getItem(SESSION_ROLE_KEY) as UserRole) || null;
  });
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    const saved = localStorage.getItem(ATTEMPTS_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);
  const [shakeTrigger, setShakeTrigger] = useState(0);

  // Check lockout on mount and tick countdown
  useEffect(() => {
    const checkLockout = () => {
      const untilStr = localStorage.getItem(LOCKOUT_KEY);
      if (untilStr) {
        const until = parseInt(untilStr, 10);
        const diff = until - Date.now();
        if (diff > 0) {
          setLockoutRemaining(Math.ceil(diff / 1000));
        } else {
          // Lockout expired
          localStorage.removeItem(LOCKOUT_KEY);
          localStorage.removeItem(ATTEMPTS_KEY);
          setLockoutRemaining(0);
          setFailedAttempts(0);
          setErrorMessage(null);
        }
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  const login = useCallback(
    async (password: string): Promise<boolean> => {
      if (lockoutRemaining > 0) {
        return false;
      }

      setIsAuthenticating(true);
      setErrorMessage(null);

      try {
        const result = await authenticateWithSinglePassword(password, config);

        if (result.success && result.role) {
          setRole(result.role);
          sessionStorage.setItem(SESSION_ROLE_KEY, result.role);
          setFailedAttempts(0);
          localStorage.removeItem(ATTEMPTS_KEY);
          localStorage.removeItem(LOCKOUT_KEY);
          setIsAuthenticating(false);
          return true;
        } else {
          // Incorrect password
          const nextAttempts = failedAttempts + 1;
          setFailedAttempts(nextAttempts);
          localStorage.setItem(ATTEMPTS_KEY, nextAttempts.toString());
          setShakeTrigger((prev) => prev + 1);

          if (nextAttempts >= MAX_ATTEMPTS) {
            const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
            localStorage.setItem(LOCKOUT_KEY, lockoutUntil.toString());
            setLockoutRemaining(60);
            setErrorMessage('Too many attempts. Locked out for 1 minute.');
          } else {
            const remaining = MAX_ATTEMPTS - nextAttempts;
            setErrorMessage(
              `Incorrect password. (${remaining} ${remaining === 1 ? 'attempt' : 'attempts'} remaining)`
            );
          }

          setIsAuthenticating(false);
          return false;
        }
      } catch (err: any) {
        setIsAuthenticating(false);
        setErrorMessage(err.message || 'Authentication error');
        setShakeTrigger((prev) => prev + 1);
        return false;
      }
    },
    [config, failedAttempts, lockoutRemaining]
  );

  const logout = useCallback(async () => {
    await signOutUser(config);
    sessionStorage.removeItem(SESSION_ROLE_KEY);
    setRole(null);
  }, [config]);

  return {
    role,
    isAdmin: role === 'admin',
    isViewer: role === 'viewer',
    isLoggedIn: role !== null,
    isAuthenticating,
    errorMessage,
    lockoutRemaining,
    shakeTrigger,
    login,
    logout,
  };
}
