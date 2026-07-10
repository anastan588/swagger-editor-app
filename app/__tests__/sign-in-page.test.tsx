import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import SignInPage from '@/app/[locale]/sign-in/page';

const mocks = vi.hoisted(() => ({
  getClaims: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getClaims: mocks.getClaims },
  }),
}));

vi.mock('next-intl/server', () => ({
  getLocale: async () => 'en',
}));

vi.mock('@/i18n/navigation', () => ({
  redirect: mocks.redirect,
}));

vi.mock('@/app/components/auth/sign-in-form', () => ({
  default: () => <div data-testid="sign-in-form" />,
}));

describe('SignInPage', () => {
  beforeEach(() => {
    mocks.getClaims.mockClear();
    mocks.redirect.mockClear();
  });

  it('renders sign-in form for unauthenticated user', async () => {
    mocks.getClaims.mockResolvedValue({ data: { claims: null } });

    render(await SignInPage());

    expect(screen.getByTestId('sign-in-form')).toBeInTheDocument();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it('redirects authenticated user to home page', async () => {
    mocks.getClaims.mockResolvedValue({ data: { claims: { sub: '123' } } });

    render(await SignInPage());

    expect(mocks.redirect).toHaveBeenCalledWith({ href: '/', locale: 'en' });
  });
});
