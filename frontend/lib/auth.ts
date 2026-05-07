import type { AuthUser } from '@/types/api';

const COOKIE_NAME = 'stromen_token_present';

export const setPresenceCookie = () => {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE_NAME}=1; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`;
};

export const clearPresenceCookie = () => {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
};

export const isAdmin = (user: AuthUser | null): boolean => {
  return user?.role === 'admin';
};

export const decodeJwtPayload = <T = unknown>(token: string): T | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const json =
      typeof atob === 'function'
        ? atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
        : Buffer.from(parts[1], 'base64').toString('utf-8');
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
};
