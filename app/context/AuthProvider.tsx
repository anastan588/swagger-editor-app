'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';

import { createClient } from '@/lib/supabase/client';

import { AuthContext } from './AuthContext';

interface AuthProviderProps {
  children: ReactNode;
  initialIsAuthenticated: boolean;
}

export const AuthProvider = ({ children, initialIsAuthenticated }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(initialIsAuthenticated);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserName(user?.user_metadata?.name || user?.email || null);
    };

    if (isAuthenticated) {
      fetchUser();
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setUserName(session?.user?.user_metadata?.name || session?.user?.email || null);
    });

    return () => subscription.unsubscribe();
  }, [isAuthenticated]);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  };

  const value = useMemo(
    () => ({
      isAuthenticated,
      userName,
      signOut,
    }),
    [isAuthenticated, userName],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
};
