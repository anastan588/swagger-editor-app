import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import HistoryPage from '@/app/[locale]/history/page';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
}));

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
  });

  it('shows the empty state with a link to the editor', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mocks.order.mockResolvedValue({ data: [] });

    const Resolved = await HistoryPage();
    render(Resolved);

    expect(screen.getByRole('link', { name: /HistoryPage.goToEditor/ })).toBeInTheDocument();
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
