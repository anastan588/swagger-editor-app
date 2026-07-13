import { act, ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ErrorPage from '@/app/[locale]/error';
import { ErrorToastProvider } from '@/app/components/ErrorToastProvider';
import { useErrorToast } from '@/app/components/useErrorToast';
import GlobalError from '@/app/global-error';

vi.mock('next-intl', () => ({
  useTranslations:
    (namespace: string) =>
    (key: string): string =>
      `${namespace}.${key}`,
}));

const ToastTrigger = ({ children = 'Trigger error' }: { children?: ReactNode }) => {
  const { showError } = useErrorToast();

  return (
    <button type="button" onClick={() => showError(String(children))}>
      {children}
    </button>
  );
};

describe('error handling', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('throws a clear error when useErrorToast is used outside ErrorToastProvider', () => {
    expect(() => render(<ToastTrigger />)).toThrow('useErrorToast must be used inside ErrorToastProvider');
  });

  it('shows toast errors from the provider and hides them after the timeout', () => {
    vi.useFakeTimers();

    render(
      <ErrorToastProvider>
        <ToastTrigger>Request failed</ToastTrigger>
      </ErrorToastProvider>,
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Request failed' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Request failed');

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('replaces the current toast error and resets the dismissal timer', () => {
    vi.useFakeTimers();

    const ReplaceableToast = () => {
      const { showError } = useErrorToast();

      return (
        <>
          <button type="button" onClick={() => showError('First error')}>
            Show first
          </button>
          <button type="button" onClick={() => showError('Second error')}>
            Show second
          </button>
        </>
      );
    };

    render(
      <ErrorToastProvider>
        <ReplaceableToast />
      </ErrorToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show first' }));

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Show second' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Second error');

    act(() => {
      vi.advanceTimersByTime(3999);
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Second error');

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders the localized route error fallback and calls retry', () => {
    const retry = vi.fn();

    render(<ErrorPage unstable_retry={retry} />);

    expect(screen.getByRole('heading', { level: 1, name: 'ErrorPage.title' })).toBeInTheDocument();
    expect(screen.getByText('ErrorPage.description')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'ErrorPage.tryAgain' }));

    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('renders the global error fallback and calls retry', () => {
    const retry = vi.fn();

    render(<GlobalError unstable_retry={retry} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Something went wrong' })).toBeInTheDocument();
    expect(screen.getByText('The application ran into a problem. Please try again.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(retry).toHaveBeenCalledTimes(1);
  });
});
