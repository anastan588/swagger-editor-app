import { createContext } from 'react';

export type ErrorToastContextValue = {
  showError: (message: string) => void;
};

export const ErrorToastContext = createContext<ErrorToastContextValue | null>(null);
