'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';
import { isAdmin } from '@/lib/auth';

export const useAuth = () => {
  const router = useRouter();
  const { token, user, hydrated, setSession, logout } = useAuthStore();

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.auth.login(email, password);
      setSession(res.accessToken, res.user);
      return res;
    },
    [setSession],
  );

  const register = useCallback(async (email: string, password: string) => {
    return api.auth.register(email, password);
  }, []);

  const signOut = useCallback(() => {
    logout();
    router.push('/');
  }, [logout, router]);

  return {
    token,
    user,
    isAuthenticated: !!token,
    isAdmin: isAdmin(user),
    hydrated,
    login,
    register,
    logout: signOut,
  };
};
