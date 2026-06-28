'use client';

import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

const AUTH_TOKEN_KEY = 'authToken';

type AuthContextValue = {
  isAuthenticated: boolean;
  isAuthReady: boolean;
  setToken: (token: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const isTokenValid = (token: string | null) => {
  if (!token) {
    return false;
  }

  try {
    const [, payload] = token.split('.');

    if (!payload) return false;

    const decodedPayload = JSON.parse(atob(payload)) as {
      exp?: number;
    };

    if (!decodedPayload.exp) return false;

    return decodedPayload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === 'undefined') return false;

    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const hasValidToken = isTokenValid(token);

    if (!hasValidToken) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }

    return hasValidToken;
  });

  const isAuthReady = true;

  const setToken = (token: string) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    setIsAuthenticated(isTokenValid(token));
  };

  const signOut = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setIsAuthenticated(false);
  };

  const value = useMemo(
    () => ({
      isAuthenticated,
      isAuthReady,
      setToken,
      signOut,
    }),
    [isAuthenticated, isAuthReady],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
