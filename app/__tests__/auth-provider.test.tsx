import React, { useContext } from 'react';
import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthContext, AuthProvider } from '@/app/context/AuthProvider';
import { createClient } from '@/lib/supabase/client';

type AuthContextValue = NonNullable<React.ContextType<typeof AuthContext>>;

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}));

const TestComponent = () => {
  const context = useContext(AuthContext) as AuthContextValue | null;
  if (!context) return <div data-testid="no-context">No Context</div>;
  return (
    <div>
      <div data-testid="auth-status">{String(context.isAuthenticated)}</div>
      <div data-testid="user-name">{context.userName ?? 'null'}</div>
      <button data-testid="signout-btn" type="button" onClick={context.signOut}>
        Sign Out
      </button>
    </div>
  );
};

describe('AuthProvider', () => {
  const mockUnsubscribe = vi.fn();
  const mockOnAuthStateChange = vi.fn().mockReturnValue({
    data: { subscription: { unsubscribe: mockUnsubscribe } },
  });
  const mockGetUser = vi.fn().mockResolvedValue({ data: { user: null } });
  const mockSignOut = vi.fn().mockResolvedValue({});

  beforeEach(() => {
    vi.resetAllMocks();

    mockGetUser.mockResolvedValue({ data: { user: null } });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });

    vi.mocked(createClient).mockReturnValue({
      auth: {
        getUser: mockGetUser,
        onAuthStateChange: mockOnAuthStateChange,
        signOut: mockSignOut,
      },
    } as unknown as ReturnType<typeof createClient>);
  });

  it('should initialize with provided initialIsAuthenticated structure state', async () => {
    await act(async () => {
      render(
        <AuthProvider initialIsAuthenticated={true}>
          <TestComponent />
        </AuthProvider>,
      );
    });

    expect(screen.getByTestId('auth-status').textContent).toBe('true');
    expect(screen.getByTestId('user-name').textContent).toBe('null');
    expect(mockOnAuthStateChange).toHaveBeenCalled();
  });

  it('should fetch metadata and resolve userName when authenticated upon mounting components', async () => {
    const mockUserResponse = {
      data: {
        user: {
          email: 'john@example.com',
          user_metadata: { name: 'John Doe' },
        },
      },
    };
    mockGetUser.mockResolvedValue(mockUserResponse);

    await act(async () => {
      render(
        <AuthProvider initialIsAuthenticated={true}>
          <TestComponent />
        </AuthProvider>,
      );
    });

    expect(screen.getByTestId('user-name').textContent).toBe('John Doe');
  });

  it('should fallback to user email address field if metadata name payload is absent', async () => {
    const mockUserResponse = {
      data: {
        user: {
          email: 'fallback@example.com',
          user_metadata: {},
        },
      },
    };
    mockGetUser.mockResolvedValue(mockUserResponse);

    await act(async () => {
      render(
        <AuthProvider initialIsAuthenticated={true}>
          <TestComponent />
        </AuthProvider>,
      );
    });

    expect(screen.getByTestId('user-name').textContent).toBe('fallback@example.com');
  });

  it('should respond to authenticating session updates triggers inside state change triggers handler', async () => {
    let changeHandler: (_event: string, session: unknown) => void = () => {};
    mockOnAuthStateChange.mockImplementation((callback) => {
      changeHandler = callback as (_event: string, session: unknown) => void;
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });

    const mockActiveUser = {
      email: 'triggered@example.com',
      user_metadata: { name: 'Active User' },
    };

    mockGetUser.mockResolvedValue({ data: { user: mockActiveUser } });

    await act(async () => {
      render(
        <AuthProvider initialIsAuthenticated={false}>
          <TestComponent />
        </AuthProvider>,
      );
    });

    expect(screen.getByTestId('auth-status').textContent).toBe('false');

    await act(async () => {
      changeHandler('SIGNED_IN', { user: mockActiveUser });
    });

    expect(screen.getByTestId('auth-status').textContent).toBe('true');
    expect(screen.getByTestId('user-name').textContent).toBe('Active User');
  });

  it('should forward structural trigger calls directly to supabase client signout utility wrappers', async () => {
    await act(async () => {
      render(
        <AuthProvider initialIsAuthenticated={true}>
          <TestComponent />
        </AuthProvider>,
      );
    });

    await act(async () => {
      screen.getByTestId('signout-btn').click();
    });

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('should execute clear teardown actions by cleaning active subscriptions dependencies on unmount', async () => {
    let unmountAction: () => void = () => {};

    await act(async () => {
      const { unmount } = render(
        <AuthProvider initialIsAuthenticated={false}>
          <TestComponent />
        </AuthProvider>,
      );
      unmountAction = unmount;
    });

    unmountAction();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
