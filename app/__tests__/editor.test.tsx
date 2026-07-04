import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import EditorPage from '@/app/[locale]/editor/page';

const mockUseAuth = vi.fn();
vi.mock('@/app/components/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/app/context/SchemaContext', () => ({
  SchemaProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="schema-provider">{children}</div>,
}));

vi.mock('@/app/components/CodeEditor', () => ({
  CodeEditor: function MockCodeEditor() {
    return <div data-testid="code-editor">Code Editor</div>;
  },
}));

vi.mock('@/app/components/SwaggerViewer', () => ({
  SwaggerViewer: function MockSwaggerViewer() {
    return <div data-testid="swagger-viewer">Swagger Viewer</div>;
  },
}));

const mockMatchMedia = (matches: boolean) => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
};

describe('EditorPage and EditorWorkspace Components', () => {
  it('renders loading spinner when auth context is initialization state', () => {
    mockUseAuth.mockReturnValue({ isAuthReady: false });
    mockMatchMedia(false);

    const { container } = render(<EditorPage />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(screen.queryByTestId('code-editor')).not.toBeInTheDocument();
  });

  it('renders horizontal flexible multi-panel workspace layout standard desktop viewports', () => {
    mockUseAuth.mockReturnValue({ isAuthReady: true });
    mockMatchMedia(false);

    render(<EditorPage />);

    expect(screen.getByTestId('schema-provider')).toBeInTheDocument();
    expect(screen.getByTestId('code-editor')).toBeInTheDocument();
    expect(screen.getByTestId('swagger-viewer')).toBeInTheDocument();

    const flexContainer = screen.getByTestId('code-editor').parentElement?.parentElement;
    expect(flexContainer).toHaveClass('flex-row');
    expect(flexContainer).not.toHaveClass('flex-col');
  });

  it('switches dynamically to portrait stack list design layouts on small screen orientations', () => {
    mockUseAuth.mockReturnValue({ isAuthReady: true });
    mockMatchMedia(true);

    render(<EditorPage />);

    const flexContainer = screen.getByTestId('code-editor').parentElement?.parentElement;
    expect(flexContainer).toHaveClass('flex-col');
    expect(flexContainer).not.toHaveClass('flex-row');

    const editorWrapper = screen.getByTestId('code-editor').parentElement;
    expect(editorWrapper).toHaveClass('w-full', 'h-[calc(50vh-40px)]');
  });
});
