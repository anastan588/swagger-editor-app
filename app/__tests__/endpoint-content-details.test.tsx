import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { EndpointContentDetails } from '@/app/components/swagger/EndpointContentDetails';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      contentType: 'Content-Type',
      schema: 'Schema',
      example: 'Example',
    };

    return translations[key] || key;
  },
}));

describe('EndpointContentDetails', () => {
  it('renders content type, schema and example from OpenAPI content', () => {
    render(
      <EndpointContentDetails
        content={{
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                title: { type: 'string' },
              },
            },
            example: {
              title: 'Clean Code',
            },
          },
        }}
      />,
    );

    expect(screen.getByText('Content-Type: application/json')).toBeInTheDocument();
    expect(screen.getByText('Schema')).toBeInTheDocument();
    expect(screen.getByText('Example')).toBeInTheDocument();
    expect(screen.getAllByText(/"title"/).length).toBeGreaterThan(0);
    expect(screen.getByText(/"Clean Code"/)).toBeInTheDocument();
  });

  it('uses the first examples map value when example is absent', () => {
    render(
      <EndpointContentDetails
        content={{
          'application/json': {
            examples: {
              created: {
                value: { id: 'book-1' },
              },
            },
          },
        }}
      />,
    );

    expect(screen.getByText(/"book-1"/)).toBeInTheDocument();
  });
});
