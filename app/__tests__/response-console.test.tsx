import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ResponseConsole } from '@/app/components/swagger/ResponseConsole';
import { ResponseState } from '@/app/components/swagger/types';

interface MockConsoleMetaProps {
  setBodyFormat: (format: 'json' | 'yaml') => void;
  responseType: string;
  activeTab: 'body' | 'headers';
}

interface MockConsoleHeadersTableProps {
  headers: Record<string, string>;
}

interface MockJSONBeautifierProps {
  rawJson: string;
}

vi.mock('@/app/utils/SwaggerViewerParser', () => ({
  stringifyToYaml: vi.fn((obj: unknown) => `yaml: ${JSON.stringify(obj)}`),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, string | number>) => {
    if (key === 'headersTab' && values) return `Headers (${values.count})`;
    const translations: Record<string, string> = {
      tracer: 'Resolved Host Tracer:',
      bodyTab: 'Response Body',
      noBody: 'No body payload content returned from target server.',
      yamlError: 'Failed to convert JSON response to YAML format.',
      copy: 'Copy JSON',
      copied: 'Copied!',
    };
    return translations[key] || key;
  },
}));

vi.mock('@/app/components/swagger/ConsoleMeta', () => ({
  ConsoleMeta: ({ setBodyFormat, responseType, activeTab }: MockConsoleMetaProps) => (
    <div data-testid="console-meta">
      <span>Type: {responseType}</span>
      {activeTab === 'body' && responseType === 'json' ? (
        <button data-testid="switch-yaml" type="button" onClick={() => setBodyFormat('yaml')}>
          Switch YAML
        </button>
      ) : null}
    </div>
  ),
}));

vi.mock('@/app/components/swagger/ConsoleHeadersTable', () => ({
  ConsoleHeadersTable: ({ headers }: MockConsoleHeadersTableProps) => (
    <div data-testid="headers-table">{JSON.stringify(headers)}</div>
  ),
}));

vi.mock('@/app/components/swagger/JSONBeautifier', () => ({
  JSONBeautifier: ({ rawJson }: MockJSONBeautifierProps) => <div data-testid="json-beautifier">{rawJson}</div>,
}));

describe('ResponseConsole', () => {
  let defaultResponseState: ResponseState;
  const writeTextMock = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
    });

    defaultResponseState = {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: '{"status": "ok"}',
      loading: false,
      requestUrl: 'https://example.com',
    };
  });

  it('renders resolved host tracer block when requestUrl property exists', () => {
    render(<ResponseConsole responseState={defaultResponseState} />);
    expect(screen.getByText('Resolved Host Tracer:')).toBeInTheDocument();
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
  });

  it('detects json content type and renders JSONBeautifier view context structure', () => {
    render(<ResponseConsole responseState={defaultResponseState} />);
    expect(screen.getByTestId('json-beautifier')).toBeInTheDocument();
    expect(screen.getByText('{"status": "ok"}')).toBeInTheDocument();
  });

  it('detects html content type when header matches or string begins with brackets tags', () => {
    const htmlState = {
      ...defaultResponseState,
      headers: { 'content-type': 'text/html' },
      body: '<html><body>Hello</body></html>',
    };

    render(<ResponseConsole responseState={htmlState} />);
    const preElement = screen.getByText('<html><body>Hello</body></html>');
    expect(preElement.tagName.toLowerCase()).toBe('pre');
  });

  it('toggles tabs display layouts matrix structures view to metadata headers table mapping', () => {
    render(<ResponseConsole responseState={defaultResponseState} />);

    const headersTabButton = screen.getByText('Headers (1)');
    fireEvent.click(headersTabButton);

    expect(screen.queryByTestId('json-beautifier')).not.toBeInTheDocument();
    expect(screen.getByTestId('headers-table')).toBeInTheDocument();
    expect(screen.getByText('{"content-type":"application/json"}')).toBeInTheDocument();
  });

  it('renders standard inline fallback label if target system returns an empty string index body', () => {
    const emptyState = { ...defaultResponseState, body: '   ' };
    render(<ResponseConsole responseState={emptyState} />);
    expect(screen.getByText('No body payload content returned from target server.')).toBeInTheDocument();
  });
});
