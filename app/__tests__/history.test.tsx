import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import HistoryView, { HistoryTranslations } from '@/app/[locale]/history/HistoryView';
import HistoryPage from '@/app/[locale]/history/page';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
  dynamicImport: vi.fn(),
}));

const translations: HistoryTranslations = {
  title: 'HistoryPage.title',
  emptyDescription: 'HistoryPage.emptyDescription',
  goToEditor: 'HistoryPage.goToEditor',
  goToViewer: 'HistoryPage.goToViewer',
  statusCode: 'HistoryPage.statusCode',
  latency: 'HistoryPage.latency',
  requestSize: 'HistoryPage.requestSize',
  responseSize: 'HistoryPage.responseSize',
  error: 'HistoryPage.error',
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: mocks.getUser }, from: mocks.from }),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

vi.mock('next-intl/server', () => ({
  getTranslations: async (namespace: string) => (key: string) => `${namespace}.${key}`,
}));

vi.mock('next/dynamic', () => ({
  default: () => {
    const DynamicHistoryView = (props: React.ComponentProps<typeof HistoryView>) => {
      mocks.dynamicImport();
      return <HistoryView {...props} />;
    };

    DynamicHistoryView.displayName = 'DynamicHistoryView';

    return DynamicHistoryView;
  },
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}));

describe('HistoryPage (server component)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.from.mockReturnValue({ select: mocks.select });
    mocks.select.mockReturnValue({ eq: mocks.eq });
    mocks.eq.mockReturnValue({ order: mocks.order });
  });

  it('redirects guests to the main page', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });

    await expect(HistoryPage()).rejects.toThrow('NEXT_REDIRECT:/');
    expect(mocks.dynamicImport).not.toHaveBeenCalled();
  });

  it('lazy-loads the history view for authenticated users', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mocks.order.mockResolvedValue({ data: [] });

    const Resolved = await HistoryPage();
    render(Resolved);

    expect(mocks.dynamicImport).toHaveBeenCalledTimes(1);
  });

  it('shows the empty state with links to the editor and viewer', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mocks.order.mockResolvedValue({ data: [] });

    const Resolved = await HistoryPage();
    render(Resolved);

    expect(screen.getByRole('link', { name: /HistoryPage.goToEditor/ })).toHaveAttribute('href', '/editor');
    expect(screen.getByRole('link', { name: /HistoryPage.goToViewer/ })).toHaveAttribute('href', '/');
  });

  it('renders history entries sorted by newest first', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mocks.order.mockResolvedValue({
      data: [
        {
          id: '1',
          method: 'GET',
          path: '/users',
          target_host: 'https://api.test',
          response_status: 200,
          latency_ms: 120,
          request_size_bytes: 0,
          response_size_bytes: 340,
          error_details: null,
          request_body: null,
          response_body: null,
          created_at: new Date().toISOString(),
        },
      ],
    });

    const Resolved = await HistoryPage();
    render(Resolved);

    expect(screen.getByText('GET')).toBeInTheDocument();
    expect(mocks.order).toHaveBeenCalledWith('created_at', { ascending: false });
  });
});

describe('HistoryView (server component)', () => {
  it('renders analytics details for each entry', () => {
    render(
      <HistoryView
        entries={[
          {
            id: '1',
            method: 'POST',
            path: '/items',
            target_host: 'https://api.test',
            response_status: 415,
            latency_ms: 80,
            request_size_bytes: 12,
            response_size_bytes: 48,
            error_details: 'Unsupported Media Type',
            request_body: null,
            response_body: null,
            created_at: '2026-01-01T12:00:00.000Z',
          },
        ]}
        translations={translations}
      />,
    );

    expect(screen.getByText('POST')).toBeInTheDocument();
    expect(screen.getByText('https://api.test/items')).toBeInTheDocument();
    expect(screen.getByText('415')).toBeInTheDocument();
    expect(screen.getByText(/Unsupported Media Type/)).toBeInTheDocument();
    expect(screen.getByText(/80 ms/)).toBeInTheDocument();
    expect(screen.getByText(/12 B/)).toBeInTheDocument();
    expect(screen.getByText(/48 B/)).toBeInTheDocument();
  });
});
