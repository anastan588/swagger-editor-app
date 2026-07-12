import { createContext } from 'react';

export interface AuthContextValue {
  isAuthenticated: boolean;
  userName: string | null;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
