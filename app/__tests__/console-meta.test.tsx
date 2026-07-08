import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConsoleMeta } from '@/app/components/swagger/ConsoleMeta';
import { ResponseState } from '@/app/components/swagger/types';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, string | number>) => {
    if (key === 'latency' && values) return `Latency: ${values.ms} ms`;
    if (key === 'length' && values) return `Length: ${values.size}`;
    if (key === 'type' && values) return `Type: ${values.type}`;

    const translations: Record<string, string> = {
      diagnostics: 'Server Diagnostics:',
    };
    return translations[key] || key;
  },
}));

describe('ConsoleMeta', () => {
  let defaultProps: {
    responseState: ResponseState;
    responseType: string;
    bodyFormat: 'json' | 'yaml';
    setBodyFormat: (format: 'json' | 'yaml') => void;
    activeTab: 'body' | 'headers';
  };

  beforeEach(() => {
    vi.clearAllMocks();

    defaultProps = {
      responseState: {
        status: 200,
        headers: {},
        body: '{}',
        loading: false,
        latency: 120,
        size: '1.2 KB',
      },
      responseType: 'json',
      bodyFormat: 'json',
      setBodyFormat: vi.fn(),
      activeTab: 'body',
    };
  });

  it('renders standard diagnostic labels text properly', () => {
    render(<ConsoleMeta {...defaultProps} />);
    expect(screen.getByText('Server Diagnostics:')).toBeInTheDocument();
  });

  it('applies emerald success class badges design for 2xx response status codes', () => {
    render(<ConsoleMeta {...defaultProps} />);

    const statusCodeElement = screen.getByText('Code 200');
    expect(statusCodeElement).toBeInTheDocument();
    expect(statusCodeElement).toHaveClass('bg-emerald-50', 'text-emerald-700');
    expect(statusCodeElement).not.toHaveClass('bg-rose-50', 'text-rose-700');
  });

  it('applies rose error class badges design for 4xx or 5xx response status codes', () => {
    defaultProps.responseState.status = 404;
    render(<ConsoleMeta {...defaultProps} />);

    const statusCodeElement = screen.getByText('Code 404');
    expect(statusCodeElement).toBeInTheDocument();
    expect(statusCodeElement).toHaveClass('bg-rose-50', 'text-rose-700');
    expect(statusCodeElement).not.toHaveClass('bg-emerald-50', 'text-emerald-700');
  });

  it('renders latency metadata block accurately when latency property exists', () => {
    render(<ConsoleMeta {...defaultProps} />);
    expect(screen.getByText('Latency: 120 ms')).toBeInTheDocument();
  });

  it('hides latency metadata block when latency property evaluates to undefined', () => {
    defaultProps.responseState.latency = undefined;
    render(<ConsoleMeta {...defaultProps} />);
    expect(screen.queryByText(/Latency:/)).not.toBeInTheDocument();
  });

  it('renders payload length data properly when size property exists', () => {
    render(<ConsoleMeta {...defaultProps} />);
    expect(screen.getByText('Length: 1.2 KB')).toBeInTheDocument();
  });

  it('hides payload length block when size property evaluates to undefined or null', () => {
    defaultProps.responseState.size = undefined;
    render(<ConsoleMeta {...defaultProps} />);
    expect(screen.queryByText(/Length:/)).not.toBeInTheDocument();
  });

  it('passes and processes responseType variable inside formatting translations text', () => {
    defaultProps.responseType = 'html';
    render(<ConsoleMeta {...defaultProps} />);
    expect(screen.getByText('Type: html')).toBeInTheDocument();
  });
});
