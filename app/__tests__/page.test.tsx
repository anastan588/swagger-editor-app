import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Home from '@/app/[locale]/page';

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
}));

vi.mock('@/app/components/EditorPageShell', () => ({
  EditorPageShell: async () => {
    return <section data-testid="editor-page-shell">Editor workspace</section>;
  },
}));

describe('Home Component (SSR Page Layout)', () => {
  it('renders the editor workspace on the main route', async () => {
    render(await Home());

    expect(screen.getByTestId('editor-page-shell')).toBeInTheDocument();
    expect(screen.getByText('Editor workspace')).toBeInTheDocument();
  });
});
