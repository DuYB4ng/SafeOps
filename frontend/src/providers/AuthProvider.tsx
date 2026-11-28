'use client';

import { createContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { authService } from '@/services/auth.service';
import type { AuthState, LoginRequest } from '@/types/auth';

type AuthContextValue = AuthState & {
  login: (values: LoginRequest) => ReturnType<typeof authService.login>;
  logout: () => Promise<void>;
  retry: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { session } = authService;
  const state = useSyncExternalStore(
    session.subscribe,
    session.getSnapshot,
    session.getServerSnapshot,
  );
  useEffect(() => {
    void authService.restore();
  }, []);
  const value = useMemo(
    () => ({
      ...state,
      login: authService.login,
      logout: authService.logout,
      retry: authService.restore,
    }),
    [state],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
