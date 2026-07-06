import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SignUpForm } from '@/app/components/auth/sign-up-form';

const mocks = vi.hoisted(() => ({
  routerPush: vi.fn(),
  routerRefresh: vi.fn(),
  signUp: vi.fn(),
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
      signUp: mocks.signUp,
    },
  }),
}));

const fillForm = (email: string, password: string, confirm: string) => {
  fireEvent.change(screen.getByLabelText('Auth.email'), { target: { value: email } });
  fireEvent.change(screen.getByLabelText('Auth.password'), { target: { value: password } });
  fireEvent.change(screen.getByLabelText('Auth.confirmPassword'), { target: { value: confirm } });
};

const getForm = () => screen.getByRole('button', { name: 'Auth.signInButton' }).closest('form')!;

describe('SignUpForm', () => {
  beforeEach(() => {
    mocks.routerPush.mockClear();
    mocks.routerRefresh.mockClear();
    mocks.signUp.mockClear();
  });

  it('renders email, password and confirmPassword fields', () => {
    render(<SignUpForm />);

    expect(screen.getByLabelText('Auth.email')).toBeInTheDocument();
    expect(screen.getByLabelText('Auth.password')).toBeInTheDocument();
    expect(screen.getByLabelText('Auth.confirmPassword')).toBeInTheDocument();
  });

  it('shows invalidEmail error when email format is wrong', async () => {
    render(<SignUpForm />);

    fillForm('not-an-email', 'Password1!', 'Password1!');
    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(screen.getByText('Auth.errors.invalidEmail')).toBeInTheDocument();
    });

    expect(mocks.signUp).not.toHaveBeenCalled();
  });

  it('shows passwordMin error when password is too short', async () => {
    render(<SignUpForm />);

    fillForm('test@test.com', 'Sh0!', 'Sh0!');
    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(screen.getByText('Auth.errors.passwordMin')).toBeInTheDocument();
    });

    expect(mocks.signUp).not.toHaveBeenCalled();
  });

  it('shows passwordDigit error when password has no digit', async () => {
    render(<SignUpForm />);

    fillForm('test@test.com', 'Password!', 'Password!');
    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(screen.getByText('Auth.errors.passwordDigit')).toBeInTheDocument();
    });

    expect(mocks.signUp).not.toHaveBeenCalled();
  });

  it('shows passwordSpecial error when password has no special character', async () => {
    render(<SignUpForm />);

    fillForm('test@test.com', 'Password1', 'Password1');
    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(screen.getByText('Auth.errors.passwordSpecial')).toBeInTheDocument();
    });

    expect(mocks.signUp).not.toHaveBeenCalled();
  });

  it('shows passwordMatch error when passwords do not match', async () => {
    render(<SignUpForm />);

    fillForm('test@test.com', 'Password1!', 'Different1!');
    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(screen.getByText('Auth.errors.passwordMatch')).toBeInTheDocument();
    });

    expect(mocks.signUp).not.toHaveBeenCalled();
  });

  it('calls signUp with email and password on valid submit', async () => {
    mocks.signUp.mockResolvedValue({ error: null });

    render(<SignUpForm />);

    fillForm('test@test.com', 'Password1!', 'Password1!');
    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(mocks.signUp).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'Password1!',
      });
    });
  });

  it('redirects to home page on successful registration', async () => {
    mocks.signUp.mockResolvedValue({ error: null });

    render(<SignUpForm />);

    fillForm('test@test.com', 'Password1!', 'Password1!');
    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(mocks.routerPush).toHaveBeenCalledWith('/');
    });
  });

  it('shows emailTaken error when email is already registered', async () => {
    mocks.signUp.mockResolvedValue({ error: { message: 'User already registered' } });

    render(<SignUpForm />);

    fillForm('existing@test.com', 'Password1!', 'Password1!');
    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(screen.getByText('Auth.errors.emailTaken')).toBeInTheDocument();
    });

    expect(mocks.routerPush).not.toHaveBeenCalled();
  });

  it('shows generic error on unknown server error', async () => {
    mocks.signUp.mockResolvedValue({ error: { message: 'Internal server error' } });

    render(<SignUpForm />);

    fillForm('test@test.com', 'Password1!', 'Password1!');
    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(screen.getByText('Auth.errors.generic')).toBeInTheDocument();
    });
  });
});
