import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SignInForm } from '@/app/components/auth/sign-in-form';

const mocks = vi.hoisted(() => ({
  routerPush: vi.fn(),
  routerRefresh: vi.fn(),
  signInWithPassword: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useTranslations:
    (namespace: string) =>
    (key: string): string =>
      `${namespace}.${key}`,
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
  useRouter: () => ({
    push: mocks.routerPush,
    refresh: mocks.routerRefresh,
  }),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mocks.signInWithPassword,
    },
  }),
}));

const getForm = () => screen.getByRole('button', { name: 'Auth.signInButton' }).closest('form')!;

describe('SignInForm', () => {
  beforeEach(() => {
    mocks.routerPush.mockClear();
    mocks.routerRefresh.mockClear();
    mocks.signInWithPassword.mockClear();
  });

  it('renders email, password fields and submit button', () => {
    render(<SignInForm />);

    expect(screen.getByLabelText('Auth.email')).toBeInTheDocument();
    expect(screen.getByLabelText('Auth.password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Auth.signInButton' })).toBeInTheDocument();
  });

  it('shows invalidEmail error when email format is wrong', async () => {
    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText('Auth.email'), { target: { value: 'not-an-email' } });
    fireEvent.change(screen.getByLabelText('Auth.password'), { target: { value: 'password123' } });
    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(screen.getByText('Auth.errors.invalidEmail')).toBeInTheDocument();
    });

    expect(mocks.signInWithPassword).not.toHaveBeenCalled();
  });

  it('shows passwordMin error when password is too short', async () => {
    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText('Auth.email'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('Auth.password'), { target: { value: 'short' } });
    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(screen.getByText('Auth.errors.passwordMin')).toBeInTheDocument();
    });

    expect(mocks.signInWithPassword).not.toHaveBeenCalled();
  });

  it('calls signInWithPassword with correct credentials on valid submit', async () => {
    mocks.signInWithPassword.mockResolvedValue({ error: null });

    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText('Auth.email'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('Auth.password'), { target: { value: 'password123' } });
    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(mocks.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      });
    });
  });

  it('redirects to home page on successful login', async () => {
    mocks.signInWithPassword.mockResolvedValue({ error: null });

    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText('Auth.email'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('Auth.password'), { target: { value: 'password123' } });
    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(mocks.routerPush).toHaveBeenCalledWith('/');
    });
  });

  it('shows invalidCredentials error on failed login', async () => {
    mocks.signInWithPassword.mockResolvedValue({ error: { message: 'Invalid login credentials' } });

    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText('Auth.email'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('Auth.password'), { target: { value: 'wrongpassword' } });
    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(screen.getByText('Auth.errors.invalidCredentials')).toBeInTheDocument();
    });

    expect(mocks.routerPush).not.toHaveBeenCalled();
  });

  it('does not redirect when login fails', async () => {
    mocks.signInWithPassword.mockResolvedValue({ error: { message: 'error' } });

    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText('Auth.email'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('Auth.password'), { target: { value: 'password123' } });
    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(mocks.signInWithPassword).toHaveBeenCalled();
    });

    expect(mocks.routerPush).not.toHaveBeenCalled();
  });
});
