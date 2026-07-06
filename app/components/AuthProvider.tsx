'use client';

import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';

import { createClient } from '@/lib/supabase/client';

interface AuthContextValue {
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
  initialIsAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children, initialIsAuthenticated }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(initialIsAuthenticated);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  };

  const value = useMemo(
    () => ({
      isAuthenticated,
      signOut,
    }),
    [isAuthenticated],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
};
