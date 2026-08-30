import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '@/services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    authService.getCurrentAdmin().then((user) => {
      if (active) {
        setAdmin(user);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const user = await authService.login(email, password);
    setAdmin(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setAdmin(null);
  }, []);

  const value = useMemo(
    () => ({
      admin,
      loading,
      isAuthenticated: Boolean(admin),
      login,
      logout,
    }),
    [admin, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** @returns {{ admin: { id: string; email: string } | null; loading: boolean; isAuthenticated: boolean; login: (email: string, password: string) => Promise<unknown>; logout: () => void }} */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
