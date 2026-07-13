import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import RootLayout from '@/app/[locale]/layout';

const mocks = vi.hoisted(() => ({
  getClaims: vi.fn().mockResolvedValue({ data: { claims: null } }),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getClaims: mocks.getClaims },
  }),
}));

vi.mock('next/font/google', () => ({
  Geist: () => ({ variable: '--font-geist-sans' }),
  Geist_Mono: () => ({ variable: '--font-geist-mono' }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/',
  useParams: () => ({ locale: 'en' }),
}));

vi.mock('next-intl', () => ({
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/app/components/Header', () => ({
  default: function MockHeader() {
    return <header data-testid="global-header">Header</header>;
  },
}));

vi.mock('@/app/components/Footer', () => ({
  default: function MockFooter() {
    return <footer data-testid="global-footer">Footer</footer>;
  },
}));

vi.mock('@/app/context/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>,
}));

describe('RootLayout Component', () => {
  it('renders correctly with global providers, header, footer and main tree wrapper', async () => {
    render(
      await RootLayout({
        children: <div data-testid="test-child">Application Content</div>,
      }),
    );

    const authProvider = screen.getByTestId('auth-provider');
    expect(authProvider).toBeInTheDocument();

    const header = screen.getByTestId('global-header');
    const footer = screen.getByTestId('global-footer');
    expect(header).toBeInTheDocument();
    expect(footer).toBeInTheDocument();

    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveClass('flex-1', 'w-full');

    const childContent = screen.getByTestId('test-child');
    expect(childContent).toBeInTheDocument();
    expect(childContent).toHaveTextContent('Application Content');
  });
});
