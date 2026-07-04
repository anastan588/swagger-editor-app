import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Home from '@/app/[locale]/page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useParams: () => ({ locale: 'en' }),
}));

vi.mock('next-intl', () => ({
  useTranslations:
    () =>
    (key: string): string =>
      `mocked_${key}`,
}));

vi.mock('@/app/components/HomeInteractive', () => ({
  default: function MockHomeInteractive({ welcome }: { welcome: string }) {
    return <h1 data-testid="mock-welcome">{welcome}</h1>;
  },
}));

describe('Home Component (SSR Page Layout)', () => {
  it('renders the base layout structure and passes translations correctly', () => {
    render(<Home />);
    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveClass('max-w-3xl');

    const decorativeLine = mainElement.querySelector('.mb-6');
    expect(decorativeLine).toBeInTheDocument();
    expect(decorativeLine).toHaveClass('bg-black', 'dark:bg-white');

    const welcomeText = screen.getByTestId('mock-welcome');
    expect(welcomeText).toBeInTheDocument();
    expect(welcomeText).toHaveTextContent('mocked_welcome');
  });
});
