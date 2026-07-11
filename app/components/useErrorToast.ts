import { useContext } from 'react';

import { ErrorToastContext } from './ErrorToastContext';

export const useErrorToast = () => {
  const context = useContext(ErrorToastContext);

  if (!context) {
    throw new Error('useErrorToast must be used inside ErrorToastProvider');
  }

  return context;
};
