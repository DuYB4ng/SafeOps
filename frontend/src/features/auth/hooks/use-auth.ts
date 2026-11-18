'use client';

import { useEffect, useState } from 'react';
import { AuthService } from '../services/auth-service';
import { AuthState, LoginCredentials, User } from '../types/auth.types';

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    setState({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    });
  }, []);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const res = await AuthService.login(credentials);
      setState({ user: res.user, isAuthenticated: true, isLoading: false });
      return res.user;
    } catch (err) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    await AuthService.logout();
    setState({ user: null, isAuthenticated: false, isLoading: false });
  };

  return {
    ...state,
    login,
    logout,
  };
}
