import '@testing-library/jest-dom/vitest';

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { JSONBeautifier } from '@/app/components/swagger/JSONBeautifier';

describe('JSONBeautifier', () => {
  it('returns empty layout structure if rawJson evaluates to an empty string', () => {
    const { container } = render(<JSONBeautifier rawJson="" />);
    const codeElement = container.querySelector('code');
    expect(codeElement).toBeInTheDocument();
    expect(codeElement?.textContent).toBe('');
  });

  it('correctly tokenizes and applies syntax highlighting classes to json keys and string values', () => {
    const jsonString = JSON.stringify({ name: 'John Doe' });
    const { container } = render(<JSONBeautifier rawJson={jsonString} />);

    const keyElement = container.querySelector('.text-purple-600');
    expect(keyElement).toBeInTheDocument();
    expect(keyElement?.textContent).toBe('"name":');

    const valueElement = container.querySelector('.text-emerald-600');
    expect(valueElement).toBeInTheDocument();
    expect(valueElement?.textContent).toBe('"John Doe"');
  });

  it('correctly identifies and highlights boolean and number values primitives tokens', () => {
    const jsonString = JSON.stringify({ active: true, count: 42 });
    const { container } = render(<JSONBeautifier rawJson={jsonString} />);

    const boolElement = container.querySelector('.text-amber-600');
    expect(boolElement).toBeInTheDocument();
    expect(boolElement?.textContent).toBe('true');

    const numElement = container.querySelector('.text-blue-600');
    expect(numElement).toBeInTheDocument();
    expect(numElement?.textContent).toBe('42');
  });

  it('correctly highlights null literal structure instances tokens', () => {
    const jsonString = JSON.stringify({ emptyValue: null });
    const { container } = render(<JSONBeautifier rawJson={jsonString} />);

    const nullElement = container.querySelector('.text-neutral-400');
    expect(nullElement).toBeInTheDocument();
    expect(nullElement?.textContent).toBe('null');
  });

  it('falls back gracefully to rendering a raw text block when json parser throws syntax exceptions', () => {
    const invalidJson = '{ name: John Doe ';
    const { container } = render(<JSONBeautifier rawJson={invalidJson} />);

    const fallbackElement = container.querySelector('.text-neutral-700');
    expect(fallbackElement).toBeInTheDocument();
    expect(fallbackElement?.textContent).toBe(invalidJson);
    expect(container.querySelector('.text-purple-600')).not.toBeInTheDocument();
  });
});
