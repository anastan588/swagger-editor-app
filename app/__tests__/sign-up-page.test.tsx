import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import SignUpPage from '@/app/[locale]/sign-up/page';

const mocks = vi.hoisted(() => ({
  getClaims: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getClaims: mocks.getClaims },
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
  beforeEach(() => {
    mocks.getClaims.mockClear();
    mocks.redirect.mockClear();
  });

  it('renders sign-up form for unauthenticated user', async () => {
    mocks.getClaims.mockResolvedValue({ data: { claims: null } });

    render(await SignUpPage());

    expect(screen.getByTestId('sign-up-form')).toBeInTheDocument();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it('redirects authenticated user to home page', async () => {
    mocks.getClaims.mockResolvedValue({ data: { claims: { sub: '123' } } });

    render(await SignUpPage());

    expect(mocks.redirect).toHaveBeenCalledWith({ href: '/', locale: 'en' });
  });
});
