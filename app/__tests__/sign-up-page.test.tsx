import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import SignUpPage from '@/app/[locale]/sign-up/page';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mocks.getUser },
  }),
}));

vi.mock('next-intl/server', () => ({
  getLocale: async () => 'en',
}));

vi.mock('@/i18n/navigation', () => ({
  redirect: mocks.redirect,
}));

vi.mock('@/app/components/auth/sign-up-form', () => ({
  SignUpForm: () => <div data-testid="sign-up-form" />,
}));

describe('SignUpPage', () => {
  it('renders sign-up form for unauthenticated user', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });

    render(await SignUpPage());

    expect(screen.getByTestId('sign-up-form')).toBeInTheDocument();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it('redirects authenticated user to home page', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: '123' } } });

    render(await SignUpPage());

    expect(mocks.redirect).toHaveBeenCalledWith({ href: '/', locale: 'en' });
  });
});
