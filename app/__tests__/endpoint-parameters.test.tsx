import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EndpointParameters } from '@/app/components/swagger/EndpointParameters';
import { ParameterSpec } from '@/app/components/swagger/types';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, string>) => {
    if (key === 'paramIn' && values) return `in ${values.location}`;
    if (key === 'placeholderParam' && values) return `Enter value (${values.type})`;

    const translations: Record<string, string> = {
      parameters: 'Parameters',
    };
    return translations[key] || key;
  },
}));

describe('EndpointParameters', () => {
  let mockParameters: ParameterSpec[];
  let mockInputs: Record<string, string>;
  let onInputChangeMock: (paramName: string, value: string) => void;

  beforeEach(() => {
    vi.clearAllMocks();

    mockParameters = [
      {
        name: 'userId',
        in: 'path',
        required: true,
        schema: { type: 'integer' },
      },
      {
        name: 'search',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
    ];

    mockInputs = {
      userId: '42',
      search: '',
    };

    onInputChangeMock = vi.fn();
  });

  it('renders section title token correctly', () => {
    render(<EndpointParameters inputs={mockInputs} parameters={mockParameters} onInputChange={onInputChangeMock} />);
    expect(screen.getByText('Parameters')).toBeInTheDocument();
  });

  it('renders parameter names and location strings blocks properly', () => {
    render(<EndpointParameters inputs={mockInputs} parameters={mockParameters} onInputChange={onInputChangeMock} />);

    expect(screen.getByText('userId')).toBeInTheDocument();
    expect(screen.getByText('in path')).toBeInTheDocument();

    expect(screen.getByText('search')).toBeInTheDocument();
    expect(screen.getByText('in query')).toBeInTheDocument();
  });

  it('renders indicator asterisk mark instance when parameter required property is true', () => {
    render(<EndpointParameters inputs={mockInputs} parameters={mockParameters} onInputChange={onInputChangeMock} />);

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('applies localized placeholders containing mapped primitive types', () => {
    render(<EndpointParameters inputs={mockInputs} parameters={mockParameters} onInputChange={onInputChangeMock} />);

    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    expect(inputs[0].placeholder).toBe('Enter value (integer)');
    expect(inputs[1].placeholder).toBe('Enter value (string)');
  });

  it('injects initial state values inside input html structures elements correctly', () => {
    render(<EndpointParameters inputs={mockInputs} parameters={mockParameters} onInputChange={onInputChangeMock} />);

    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    expect(inputs[0].value).toBe('42');
    expect(inputs[1].value).toBe('');
  });

  it('triggers onInputChange handler method tracking correctly when user updates value', () => {
    render(<EndpointParameters inputs={mockInputs} parameters={mockParameters} onInputChange={onInputChangeMock} />);

    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[1], { target: { value: 'test-query' } });

    expect(onInputChangeMock).toHaveBeenCalledWith('search', 'test-query');
  });
});
