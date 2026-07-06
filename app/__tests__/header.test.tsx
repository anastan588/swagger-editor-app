import { type AnchorHTMLAttributes } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Header from '@/app/components/Header';

const mocks = vi.hoisted(() => ({
  locale: 'en',
  pathname: '/',
  routerReplace: vi.fn(),
  routerRefresh: vi.fn(),
  signOut: vi.fn(),
  authState: {
    isAuthenticated: false,
    isAuthReady: true,
  },
}));

vi.mock('next-intl', () => ({
  useLocale: () => mocks.locale,
  useTranslations:
    (namespace: string) =>
    (key: string): string =>
      `${namespace}.${key}`,
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  usePathname: () => mocks.pathname,
  useRouter: () => ({
    replace: mocks.routerReplace,
    refresh: mocks.routerRefresh,
  }),
}));

vi.mock('@/app/components/useAuth', () => ({
  useAuth: () => ({
    ...mocks.authState,
    signOut: mocks.signOut,
  }),
}));

describe('App Header', () => {
  beforeEach(() => {
    mocks.locale = 'en';
    mocks.pathname = '/';
    mocks.authState = { isAuthenticated: false, isAuthReady: true };
    mocks.routerReplace.mockClear();
    mocks.routerRefresh.mockClear();
    mocks.signOut.mockClear();
  });

  it('renders public navigation and auth links for guests', () => {
    mocks.pathname = '/about';

    render(<Header />);

    expect(screen.getByRole('link', { name: 'Header.logo' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Header.editor' })).toHaveAttribute('href', '/editor');
    expect(screen.getByRole('link', { name: 'Header.about' })).toHaveAttribute('href', '/about');
    expect(screen.getByRole('link', { name: 'Header.signIn' })).toHaveAttribute('href', '/sign-in');
    expect(screen.getByRole('link', { name: 'Header.signUp' })).toHaveAttribute('href', '/sign-up');
    expect(screen.getByRole('combobox')).toHaveValue('en');
  });

  it('renders authenticated links and signs out', async () => {
    mocks.authState = { isAuthenticated: true, isAuthReady: true };
    mocks.signOut.mockResolvedValue(undefined);

    render(<Header />);

    expect(screen.getByRole('link', { name: 'Header.history' })).toHaveAttribute('href', '/history');

    fireEvent.click(screen.getByRole('button', { name: 'Header.signOut' }));

    expect(mocks.signOut).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(mocks.routerReplace).toHaveBeenCalledWith('/');
    });
  });
});
