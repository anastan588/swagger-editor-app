import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import HistoryPage from '@/app/[locale]/history/page';

const mocks = vi.hoisted(() => ({
  routerReplace: vi.fn(),
  authState: {
    isAuthenticated: false,
    isAuthReady: true,
  },
}));

vi.mock('next-intl', () => ({
  useTranslations:
    (namespace: string) =>
    (key: string): string =>
      `${namespace}.${key}`,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    replace: mocks.routerReplace,
  }),
}));

vi.mock('@/app/components/useAuth', () => ({
  useAuth: () => mocks.authState,
}));

describe('History and analytics page', () => {
  beforeEach(() => {
    mocks.authState = { isAuthenticated: false, isAuthReady: true };
    mocks.routerReplace.mockClear();
  });

  it('redirects guests to the editor page', async () => {
    const { container } = render(<HistoryPage />);

    expect(container).toBeEmptyDOMElement();

    await waitFor(() => {
      expect(mocks.routerReplace).toHaveBeenCalledWith('/');
    });
  });

  it('renders history content for authenticated users', () => {
    mocks.authState = { isAuthenticated: true, isAuthReady: true };

    render(<HistoryPage />);

    expect(screen.getByRole('heading', { level: 1, name: 'HistoryPage.title' })).toBeInTheDocument();
  });
});
