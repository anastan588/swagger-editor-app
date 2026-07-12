import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CodeEditor } from '@/app/components/CodeEditor';
import { ErrorToastContext } from '@/app/components/ErrorToastContext';

const mockUseSchema = vi.fn();
const mockUseAuth = vi.fn();
vi.mock('@/app/context/SchemaContextValue', () => ({
  useSchema: () => mockUseSchema(),
}));

vi.mock('@/app/components/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className }: React.ComponentPropsWithoutRef<'button'>) => (
    <button className={className} disabled={disabled} type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: ({ value, onChange, placeholder, className }: React.ComponentPropsWithoutRef<'textarea'>) => (
    <textarea className={className} placeholder={placeholder} value={value} onChange={onChange} />
  ),
}));

vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children, className }: React.ComponentPropsWithoutRef<'div'>) => (
    <div className={className}>{children}</div>
  ),
  AlertTitle: ({ children, className }: React.ComponentPropsWithoutRef<'div'>) => (
    <div className={className}>{children}</div>
  ),
  AlertDescription: ({ children, className }: React.ComponentPropsWithoutRef<'div'>) => (
    <div className={className}>{children}</div>
  ),
}));

const mockShowOpenFilePicker = vi.fn();

describe('CodeEditor Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
    vi.stubGlobal('window', {
      showOpenFilePicker: mockShowOpenFilePicker,
    });
  });

  it('renders successful green indicators panel when openapi specification is valid', () => {
    mockUseSchema.mockReturnValue({
      schema: 'openapi: 3.0.0',
      setSchema: vi.fn(),
      format: 'yaml',
      toggleFormat: vi.fn(),
      isValid: true,
      isSaved: true,
      errors: [],
      saveSchema: vi.fn(),
    });

    render(<CodeEditor />);

    expect(screen.getByText('validSchemaMsg')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('openapi: 3.0.0');
    expect(screen.getByRole('button', { name: 'savedBtn' })).toBeDisabled();
  });

  it('renders error block panel list when openapi specification is invalid', () => {
    mockUseSchema.mockReturnValue({
      schema: 'invalid code',
      setSchema: vi.fn(),
      format: 'json',
      toggleFormat: vi.fn(),
      isValid: false,
      isSaved: false,
      errors: ['Syntax Error Line 1', 'Missing Field'],
      saveSchema: vi.fn(),
    });

    render(<CodeEditor />);

    expect(screen.getByText('invalidSchemaTitle')).toBeInTheDocument();
    expect(screen.getByText('Syntax Error Line 1')).toBeInTheDocument();
    expect(screen.getByText('Missing Field')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'saveSchemaBtn' })).toBeEnabled();
  });

  it('disables schema saving for non-authenticated users', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    mockUseSchema.mockReturnValue({
      schema: 'openapi: 3.0.0',
      setSchema: vi.fn(),
      format: 'yaml',
      toggleFormat: vi.fn(),
      isValid: true,
      isSaved: false,
      errors: [],
      saveSchema: vi.fn(),
    });

    render(<CodeEditor />);

    expect(screen.getByRole('button', { name: 'signInToSaveBtn' })).toBeDisabled();
  });

  it('triggers asynchronous file selector streaming pipelines when load file option click', async () => {
    const setSchemaMock = vi.fn();
    mockUseSchema.mockReturnValue({
      schema: '',
      setSchema: setSchemaMock,
      format: 'json',
      toggleFormat: vi.fn(),
      isValid: false,
      isSaved: true,
      errors: [],
      saveSchema: vi.fn(),
    });

    const mockFile = new File(['{"openapi": "3.0.0"}'], 'schema.json', { type: 'application/json' });
    mockShowOpenFilePicker.mockResolvedValue([
      {
        getFile: async () => mockFile,
      },
    ]);

    const { container } = render(<CodeEditor />);

    const loadButton = screen.getByRole('button', { name: 'loadFileBtn' });
    fireEvent.click(loadButton);

    await waitFor(
      () => {
        expect(mockShowOpenFilePicker).toHaveBeenCalled();
        expect(setSchemaMock).toHaveBeenCalledWith('{"openapi": "3.0.0"}');
      },
      { container },
    );
  });

  it('shows a user-friendly error when file loading fails', async () => {
    const showError = vi.fn();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockUseSchema.mockReturnValue({
      schema: '',
      setSchema: vi.fn(),
      format: 'json',
      toggleFormat: vi.fn(),
      isValid: false,
      isSaved: true,
      errors: [],
      saveSchema: vi.fn(),
    });
    mockShowOpenFilePicker.mockRejectedValue(new Error('File system failed'));

    const { container } = render(
      <ErrorToastContext value={{ showError }}>
        <CodeEditor />
      </ErrorToastContext>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'loadFileBtn' }));

    await waitFor(
      () => {
        expect(showError).toHaveBeenCalledWith('loadFileError');
      },
      { container },
    );

    errorSpy.mockRestore();
  });

  it('shows a user-friendly error when schema saving fails', async () => {
    const showError = vi.fn();
    mockUseSchema.mockReturnValue({
      schema: 'openapi: 3.0.0',
      setSchema: vi.fn(),
      format: 'yaml',
      toggleFormat: vi.fn(),
      isValid: true,
      isSaved: false,
      errors: [],
      saveSchema: vi.fn().mockRejectedValue(new Error('Save failed')),
    });

    const { container } = render(
      <ErrorToastContext value={{ showError }}>
        <CodeEditor />
      </ErrorToastContext>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'saveSchemaBtn' }));

    await waitFor(
      () => {
        expect(showError).toHaveBeenCalledWith('saveSchemaError');
      },
      { container },
    );
  });

  it('triggers fallback input file loader pipeline when showOpenFilePicker is undefined', async () => {
    vi.stubGlobal('window', {});
    const setSchemaMock = vi.fn();
    mockUseSchema.mockReturnValue({
      schema: '',
      setSchema: setSchemaMock,
      format: 'json',
      toggleFormat: vi.fn(),
      isValid: false,
      isSaved: true,
      errors: [],
      saveSchema: vi.fn(),
    });

    const mockInputElement = {
      click: vi.fn(),
      onchange: vi.fn(),
      remove: vi.fn(),
      type: '',
      accept: '',
    };

    const originalCreateElement = document.createElement;
    document.createElement = vi.fn().mockImplementation((tagName: string) => {
      if (tagName === 'input') return mockInputElement;
      return originalCreateElement.call(document, tagName);
    }) as unknown as typeof document.createElement;

    const { container } = render(<CodeEditor />);
    const loadButton = screen.getByRole('button', { name: 'loadFileBtn' });
    fireEvent.click(loadButton);

    expect(document.createElement).toHaveBeenCalledWith('input');
    expect(mockInputElement.click).toHaveBeenCalled();

    const mockFile = new File(['openapi: 3.0.0 fallback'], 'schema.yaml', { type: 'text/yaml' });
    const mockEvent = {
      target: {
        files: [mockFile],
      },
    };

    await mockInputElement.onchange(mockEvent);

    await waitFor(
      () => {
        expect(setSchemaMock).toHaveBeenCalledWith('openapi: 3.0.0 fallback');
        expect(mockInputElement.remove).toHaveBeenCalled();
      },
      { container },
    );

    document.createElement = originalCreateElement;
  });

  it('filters specific swagger ui console warnings in execution effect layers', () => {
    mockUseSchema.mockReturnValue({
      schema: '',
      setSchema: vi.fn(),
      format: 'yaml',
      toggleFormat: vi.fn(),
      isValid: false,
      isSaved: true,
      errors: [],
      saveSchema: vi.fn(),
    });

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<CodeEditor />);

    console.warn('UNSAFE_componentWillReceiveProps warning message');
    console.error('ModelCollapse error message');
    console.warn('Genuine developer warning trace');

    expect(warnSpy).not.toHaveBeenCalledWith('UNSAFE_componentWillReceiveProps warning message');
    expect(errorSpy).not.toHaveBeenCalledWith('ModelCollapse error message');
    expect(warnSpy).toHaveBeenCalledWith('Genuine developer warning trace');

    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('renders standard emptySchemaMsg when schema is invalid and errors index token is blank string', () => {
    mockUseSchema.mockReturnValue({
      schema: 'broken spec',
      setSchema: vi.fn(),
      format: 'yaml',
      toggleFormat: vi.fn(),
      isValid: false,
      isSaved: true,
      errors: [''],
      saveSchema: vi.fn(),
    });

    render(<CodeEditor />);
    expect(screen.getByText('emptySchemaMsg')).toBeInTheDocument();
  });
});
