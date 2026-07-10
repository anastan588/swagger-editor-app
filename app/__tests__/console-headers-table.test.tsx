import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ConsoleHeadersTable } from '@/app/components/swagger/ConsoleHeadersTable';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      thField: 'Header Field',
      thValue: 'Value Mapping Pair',
      noHeaders: 'No custom envelope headers detected.',
    };
    return translations[key] || key;
  },
}));

describe('ConsoleHeadersTable', () => {
  it('renders table headers correctly using internationalization tokens', () => {
    render(<ConsoleHeadersTable headers={{}} />);

    expect(screen.getByText('Header Field')).toBeInTheDocument();
    expect(screen.getByText('Value Mapping Pair')).toBeInTheDocument();
  });

  it('renders rows mapping pairs correctly when headers object is provided', () => {
    const sampleHeaders = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer token_123',
      'X-Proxy-Target': 'https://api.com',
    };

    render(<ConsoleHeadersTable headers={sampleHeaders} />);

    expect(screen.getByText('Content-Type')).toBeInTheDocument();
    expect(screen.getByText('application/json')).toBeInTheDocument();

    expect(screen.getByText('Authorization')).toBeInTheDocument();
    expect(screen.getByText('Bearer token_123')).toBeInTheDocument();

    expect(screen.getByText('X-Proxy-Target')).toBeInTheDocument();
    expect(screen.getByText('https://api.com')).toBeInTheDocument();

    expect(screen.queryByText('No custom envelope headers detected.')).not.toBeInTheDocument();
  });

  it('renders fallback empty row message when headers object contains no keys', () => {
    render(<ConsoleHeadersTable headers={{}} />);

    expect(screen.getByText('No custom envelope headers detected.')).toBeInTheDocument();
  });

  it('renders fallback empty row message safely if headers prop evaluates to undefined or null', () => {
    render(<ConsoleHeadersTable headers={null as unknown as Record<string, string>} />);

    expect(screen.getByText('No custom envelope headers detected.')).toBeInTheDocument();
  });
});
