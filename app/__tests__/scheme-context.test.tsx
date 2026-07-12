import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorToastContext } from '@/app/components/ErrorToastContext';
import { AuthContext } from '@/app/context/AuthContext';
import { SchemaProvider } from '@/app/context/SchemaContext';
import { useSchema } from '@/app/context/SchemaContextValue';
import { parseInitialSchema } from '@/app/utils/schemaParser';
import { jsonToYaml, yamlToJson } from '@/app/utils/yamlCompiler';
import { createClient } from '@/lib/supabase/client';

type AuthContextValue = NonNullable<React.ContextType<typeof AuthContext>>;

vi.mock('@/app/utils/schemaParser', () => ({
  parseInitialSchema: vi.fn(),
}));

vi.mock('@/app/utils/yamlCompiler', () => ({
  jsonToYaml: vi.fn(),
  yamlToJson: vi.fn(),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}));

const TestComponent = () => {
  const context = useSchema();
  return (
    <div>
      <div data-testid="schema">{context.schema}</div>
      <div data-testid="format">{context.format}</div>
      <div data-testid="isValid">{String(context.isValid)}</div>
      <div data-testid="isSaved">{String(context.isSaved)}</div>
      <div data-testid="errors">{JSON.stringify(context.errors)}</div>
      <div data-testid="endpoints">{JSON.stringify(context.endpoints)}</div>
      <button data-testid="set-btn" type="button" onClick={() => context.setSchema('new-schema')}>
        Set
      </button>
      <button data-testid="toggle-btn" type="button" onClick={() => context.toggleFormat()}>
        Toggle
      </button>
      <button data-testid="save-btn" type="button" onClick={() => context.saveSchema()}>
        Save
      </button>
    </div>
  );
};

const createMockAuthContext = (isAuthenticated: boolean): AuthContextValue => ({
  isAuthenticated,
  userName: isAuthenticated ? 'John Doe' : '',
  signOut: vi.fn().mockResolvedValue(undefined),
});

const renderWithProviders = (
  initialSchema: string,
  authValue: AuthContextValue | null = createMockAuthContext(true),
  showError?: (message: string) => void,
) => {
  return render(
    <AuthContext.Provider value={authValue}>
      <ErrorToastContext value={{ showError: showError ?? vi.fn() }}>
        <SchemaProvider initialSchema={initialSchema}>
          <TestComponent />
        </SchemaProvider>
      </ErrorToastContext>
    </AuthContext.Provider>,
  );
};

describe('SchemaProvider', () => {
  const mockParsedData = {
    format: 'json' as const,
    isValid: true,
    errors: [] as string[],
    endpoints: [{ path: '/api/v1', method: 'GET' }],
    fullObject: {},
  };

  beforeEach(() => {
    vi.resetAllMocks();
    window.localStorage.clear();
    vi.mocked(parseInitialSchema).mockReturnValue(mockParsedData as ReturnType<typeof parseInitialSchema>);
  });

  it('should throw an error if used outside SchemaProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow('useSchema must be used within SchemaProvider');

    consoleSpy.mockRestore();
  });

  it('should pass initial state correctly when user is authenticated', () => {
    renderWithProviders('{"key": "value"}');

    expect(screen.getByTestId('schema').textContent).toBe('{"key": "value"}');
    expect(screen.getByTestId('format').textContent).toBe('json');
    expect(screen.getByTestId('isValid').textContent).toBe('true');
    expect(screen.getByTestId('isSaved').textContent).toBe('true');
    expect(screen.getByTestId('endpoints').textContent).toContain('/api/v1');
  });

  it('should expose local editor state when user is not authenticated', () => {
    renderWithProviders('{"key": "value"}', createMockAuthContext(false));

    expect(screen.getByTestId('schema').textContent).toBe('{"key": "value"}');
    expect(screen.getByTestId('isValid').textContent).toBe('true');
    expect(screen.getByTestId('errors').textContent).toBe('[]');
    expect(screen.getByTestId('endpoints').textContent).toContain('/api/v1');
  });

  it('should update schema and recalculate parsed variables on change', () => {
    const updatedParsedData = {
      format: 'json' as const,
      isValid: false,
      errors: ['Syntax error'],
      endpoints: [] as { path: string; method: string }[],
      fullObject: {},
    };
    vi.mocked(parseInitialSchema)
      .mockReturnValueOnce(mockParsedData as ReturnType<typeof parseInitialSchema>)
      .mockReturnValueOnce(updatedParsedData as ReturnType<typeof parseInitialSchema>);

    renderWithProviders('initial');

    act(() => {
      screen.getByTestId('set-btn').click();
    });

    expect(screen.getByTestId('schema').textContent).toBe('new-schema');
    expect(screen.getByTestId('isSaved').textContent).toBe('false');
    expect(screen.getByTestId('isValid').textContent).toBe('false');
    expect(screen.getByTestId('errors').textContent).toContain('Syntax error');
  });

  it('should update local schema changes if user is unauthenticated', () => {
    renderWithProviders('initial', createMockAuthContext(false));

    act(() => {
      screen.getByTestId('set-btn').click();
    });

    expect(screen.getByTestId('schema').textContent).toBe('new-schema');
    expect(parseInitialSchema).toHaveBeenCalledTimes(2);
    expect(window.localStorage.getItem('swagger-editor-schema-draft')).toBeNull();
  });

  it('should not restore draft schema from localStorage when user is unauthenticated', async () => {
    window.localStorage.setItem('swagger-editor-schema-draft', 'draft-schema');

    renderWithProviders('', createMockAuthContext(false));

    await waitFor(() => {
      expect(window.localStorage.getItem('swagger-editor-schema-draft')).toBeNull();
    });
    expect(screen.getByTestId('schema').textContent).toBe('');
    expect(screen.getByTestId('isSaved').textContent).toBe('true');
  });

  it('should restore draft schema from localStorage as unsaved when user is authenticated', async () => {
    window.localStorage.setItem('swagger-editor-schema-draft', 'draft-schema');

    renderWithProviders('');

    await waitFor(() => {
      expect(screen.getByTestId('schema').textContent).toBe('draft-schema');
      expect(screen.getByTestId('isSaved').textContent).toBe('false');
    });
  });

  it('should clear validation state if updated schema string is empty', () => {
    renderWithProviders('initial');

    vi.mocked(parseInitialSchema).mockReturnValue({
      format: 'json',
      isValid: false,
      errors: [],
      endpoints: [],
      fullObject: {},
    } as ReturnType<typeof parseInitialSchema>);

    act(() => {
      screen.getByTestId('set-btn').click();
    });

    expect(parseInitialSchema).toHaveBeenCalled();
  });

  it('should upscale schema format to yaml via toggleFormat', () => {
    vi.mocked(jsonToYaml).mockReturnValue('key: value');
    renderWithProviders('{"key": "value"}');

    act(() => {
      screen.getByTestId('toggle-btn').click();
    });

    expect(screen.getByTestId('schema').textContent).toBe('key: value');
    expect(screen.getByTestId('format').textContent).toBe('yaml');
    expect(screen.getByTestId('isSaved').textContent).toBe('false');
  });

  it('should downscale schema format to json via toggleFormat', () => {
    vi.mocked(parseInitialSchema).mockReturnValue({
      ...mockParsedData,
      format: 'yaml',
    } as ReturnType<typeof parseInitialSchema>);
    vi.mocked(yamlToJson).mockReturnValue('{"key": "value"}');
    renderWithProviders('key: value');

    act(() => {
      screen.getByTestId('toggle-btn').click();
    });

    expect(screen.getByTestId('schema').textContent).toBe('{"key": "value"}');
    expect(screen.getByTestId('format').textContent).toBe('json');
  });

  it('should append structured conversion string message if toggleFormat throws an error', () => {
    const showError = vi.fn();
    vi.mocked(jsonToYaml).mockImplementation(() => {
      throw new Error('YAML generation broken');
    });
    renderWithProviders('{"key": "value"}', createMockAuthContext(true), showError);

    act(() => {
      screen.getByTestId('toggle-btn').click();
    });

    expect(screen.getByTestId('errors').textContent).toContain('YAML generation broken');
    expect(showError).toHaveBeenCalledWith('YAML generation broken');
  });

  it('should invoke supabase upsert when saveSchema is called with layout values', async () => {
    const mockUpsert = vi.fn().mockResolvedValue({ error: null });
    const mockFrom = vi.fn().mockReturnValue({ upsert: mockUpsert });
    const mockGetUser = vi.fn().mockResolvedValue({ data: { user: { id: 'usr_123' } } });

    vi.mocked(createClient).mockReturnValue({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    } as unknown as ReturnType<typeof createClient>);

    renderWithProviders('valid-schema');

    await act(async () => {
      await screen.getByTestId('save-btn').click();
    });

    expect(mockFrom).toHaveBeenCalledWith('schemas');
    expect(mockUpsert).toHaveBeenCalledWith(expect.objectContaining({ user_id: 'usr_123', content: 'valid-schema' }), {
      onConflict: 'user_id',
    });
    expect(screen.getByTestId('isSaved').textContent).toBe('true');
  });

  it('should invoke supabase delete when saveSchema is called with an empty layout value', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ delete: mockDelete });
    const mockGetUser = vi.fn().mockResolvedValue({ data: { user: { id: 'usr_123' } } });

    vi.mocked(createClient).mockReturnValue({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    } as unknown as ReturnType<typeof createClient>);

    renderWithProviders('   ');

    await act(async () => {
      await screen.getByTestId('save-btn').click();
    });

    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith('user_id', 'usr_123');
    expect(screen.getByTestId('schema').textContent).toBe('');
  });

  it('should show a user-friendly message when schema upsert fails', async () => {
    const showError = vi.fn();
    const mockUpsert = vi.fn().mockResolvedValue({ error: new Error('Database write failed') });
    const mockFrom = vi.fn().mockReturnValue({ upsert: mockUpsert });
    const mockGetUser = vi.fn().mockResolvedValue({ data: { user: { id: 'usr_123' } } });

    vi.mocked(createClient).mockReturnValue({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    } as unknown as ReturnType<typeof createClient>);

    renderWithProviders('valid-schema', createMockAuthContext(true), showError);

    await act(async () => {
      await screen.getByTestId('save-btn').click();
    });

    expect(showError).toHaveBeenCalledWith('Unable to save the schema. Please try again.');
    expect(screen.getByTestId('isSaved').textContent).toBe('true');
  });
});
