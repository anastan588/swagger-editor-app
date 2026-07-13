import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Footer from '@/app/components/Footer';

vi.mock('next-intl', () => ({
  useTranslations:
    () =>
    (key: string): string =>
      `mocked_${key}`,
}));

// 2. Мокаем кастомный Link из i18n навигации, заменяя его на обычный тег <a>
vi.mock('@/i18n/navigation', () => ({
  Link: function MockLink({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) {
    return (
      <a className={className} href={href}>
        {children}
      </a>
    );
  },
}));

describe('Footer Component', () => {
  it('renders correctly with translated text and about navigation link', () => {
    render(<Footer />);
    const footerElement = screen.getByRole('contentinfo');
    expect(footerElement).toBeInTheDocument();
    expect(footerElement).toHaveClass('border-t', 'bg-white');
    const createdText = screen.getByText('mocked_created');
    expect(createdText).toBeInTheDocument();
    expect(createdText).toHaveClass('text-muted-foreground');
    const aboutLink = screen.getByRole('link', { name: 'mocked_about' });
    expect(aboutLink).toBeInTheDocument();
    expect(aboutLink).toHaveAttribute('href', '/about');
    expect(aboutLink).toHaveClass('font-medium', 'text-muted-foreground');
  });
});
