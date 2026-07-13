'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';

import ErrorAlert from './ErrorAlert';
import { ErrorToastContext } from './ErrorToastContext';

type ErrorToastProviderProps = {
  children: ReactNode;
};

export const ErrorToastProvider = ({ children }: ErrorToastProviderProps) => {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) {
      return;
    }

    const timerId = window.setTimeout(() => {
      setMessage(null);
    }, 4000);

    return () => window.clearTimeout(timerId);
  }, [message]);

  const value = useMemo(
    () => ({
      showError: setMessage,
    }),
    [],
  );

  return (
    <ErrorToastContext value={value}>
      {children}

      {message ? (
        <div className="fixed right-4 bottom-4 z-50 max-w-sm">
          <ErrorAlert message={message} />
        </div>
      ) : null}
    </ErrorToastContext>
  );
};
