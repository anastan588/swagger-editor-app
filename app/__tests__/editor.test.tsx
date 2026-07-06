import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import EditorPage from '@/app/[locale]/editor/page';
import { AuthContext } from '@/app/context/AuthProvider';

const mocks = vi.hoisted(() => ({
  getClaims: vi.fn(),
  getUser: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  maybeSingle: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      getClaims: mocks.getClaims,
      getUser: mocks.getUser,
    },
    from: mocks.from,
  }),
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

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

const mockMatchMedia = (matches: boolean) => {
  vi.stubGlobal('window', {
    matchMedia: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn((event, callback) => callback({ matches })),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

describe('EditorPage and EditorWorkspace Components', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mocks.getClaims.mockClear();
    mocks.getUser.mockClear();
    mocks.from.mockClear();
    mocks.select.mockClear();
    mocks.eq.mockClear();
    mocks.maybeSingle.mockClear();

    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user_123' } } });
    mocks.from.mockReturnValue({ select: mocks.select });
    mocks.select.mockReturnValue({ eq: mocks.eq });
    mocks.eq.mockReturnValue({ maybeSingle: mocks.maybeSingle });
    mocks.maybeSingle.mockResolvedValue({ data: { content: 'swagger: "2.0"' } });
  });

  it('renders horizontal flexible multi-panel workspace layout standard desktop viewports', async () => {
    mockMatchMedia(false);

    render(
      <AuthContext.Provider value={{ isAuthenticated: true, userName: 'Test', signOut: vi.fn() }}>
        {await EditorPage()}
      </AuthContext.Provider>,
    );

    expect(screen.getByTestId('schema-provider')).toBeInTheDocument();
    expect(screen.getByTestId('code-editor')).toBeInTheDocument();
    expect(screen.getByTestId('swagger-viewer')).toBeInTheDocument();

    const flexContainer = screen.getByTestId('code-editor').parentElement?.parentElement;
    expect(flexContainer).toHaveClass('flex-row');
    expect(flexContainer).not.toHaveClass('flex-col');
  });

  it('switches dynamically to portrait stack list design layouts on small screen orientations', async () => {
    mockMatchMedia(true);

    render(
      <AuthContext.Provider value={{ isAuthenticated: true, userName: 'Test', signOut: vi.fn() }}>
        {await EditorPage()}
      </AuthContext.Provider>,
    );

    const flexContainer = screen.getByTestId('code-editor').parentElement?.parentElement;
    expect(flexContainer).toHaveClass('flex-col');
    expect(flexContainer).not.toHaveClass('flex-row');

    const editorWrapper = screen.getByTestId('code-editor').parentElement;
    expect(editorWrapper).toHaveClass('w-full', 'h-[calc(50vh-40px)]');
  });
});
