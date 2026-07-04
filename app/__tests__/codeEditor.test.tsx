import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CodeEditor } from '@/app/components/CodeEditor';

const mockUseSchema = vi.fn();
vi.mock('@/app/context/SchemaContext', () => ({
  useSchema: () => mockUseSchema(),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/app/components/EditorSkeleton', () => ({
  EditorSkeleton: function MockSkeleton() {
    return <div data-testid="editor-skeleton">Skeleton Loading...</div>;
  },
}));

const mockShowOpenFilePicker = vi.fn();
vi.stubGlobal('window', {
  showOpenFilePicker: mockShowOpenFilePicker,
});

describe('CodeEditor Component', () => {
  it('renders editor skeleton when schema context state is not ready', () => {
    mockUseSchema.mockReturnValue({
      schema: '',
      setSchema: vi.fn(),
      format: 'yaml',
      toggleFormat: vi.fn(),
      isValid: false,
      isSaved: true,
      isReady: false,
      errors: [],
      saveSchema: vi.fn(),
    });

    render(<CodeEditor />);
    expect(screen.getByTestId('editor-skeleton')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('renders successful green indicators panel when openapi specification is valid', () => {
    mockUseSchema.mockReturnValue({
      schema: 'openapi: 3.0.0',
      setSchema: vi.fn(),
      format: 'yaml',
      toggleFormat: vi.fn(),
      isValid: true,
      isSaved: true,
      isReady: true,
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
      isReady: true,
      errors: ['Syntax Error Line 1', 'Missing Field'],
      saveSchema: vi.fn(),
    });

    render(<CodeEditor />);

    expect(screen.getByText('invalidSchemaTitle')).toBeInTheDocument();
    expect(screen.getByText('Syntax Error Line 1')).toBeInTheDocument();
    expect(screen.getByText('Missing Field')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'saveSchemaBtn' })).toBeEnabled();
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
      isReady: true,
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

  it('triggers fallback input file loader pipeline when showOpenFilePicker is undefined', async () => {
    vi.stubGlobal('window', { showOpenFilePicker: undefined });
    const setSchemaMock = vi.fn();
    mockUseSchema.mockReturnValue({
      schema: '',
      setSchema: setSchemaMock,
      format: 'json',
      toggleFormat: vi.fn(),
      isValid: false,
      isSaved: true,
      isReady: true,
      errors: [],
      saveSchema: vi.fn(),
    });

    const mockInputElement = {
      click: vi.fn(),
      onchange: vi.fn(),
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

    mockInputElement.onchange(mockEvent);

    await waitFor(
      () => {
        expect(setSchemaMock).toHaveBeenCalledWith('openapi: 3.0.0 fallback');
      },
      { container },
    );

    document.createElement = originalCreateElement;
    vi.stubGlobal('window', { showOpenFilePicker: mockShowOpenFilePicker });
  });

  it('filters specific swagger ui console warnings in execution effect layers', () => {
    mockUseSchema.mockReturnValue({
      schema: '',
      setSchema: vi.fn(),
      format: 'yaml',
      toggleFormat: vi.fn(),
      isValid: false,
      isSaved: true,
      isReady: true,
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
      isReady: true,
      errors: [''],
      saveSchema: vi.fn(),
    });

    render(<CodeEditor />);
    expect(screen.getByText('emptySchemaMsg')).toBeInTheDocument();
  });
});
