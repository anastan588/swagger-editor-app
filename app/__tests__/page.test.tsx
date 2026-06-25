import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Home from '@/app/[locale]/page';

vi.mock('next-intl', () => ({
  useTranslations:
    () =>
    (key: string): string =>
      `mocked_${key}`,
}));

vi.mock('@/app/components/LanguageSwitcher', () => ({
  default: function MockLanguageSwitcher() {
    return <div data-testid="language-switcher">Language Switcher</div>;
  },
}));

describe('Home Component', () => {
  it('renders the header with translated text content', () => {
    render(<Home />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('mocked_title');
  });
});
