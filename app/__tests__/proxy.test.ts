import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { updateSession } from '@/lib/supabase/proxy';
import { proxy } from '@/proxy';

const mocks = vi.hoisted(() => ({
  intlMiddleware: vi.fn(),
}));

vi.mock('next-intl/middleware', () => ({
  default: vi.fn(() => mocks.intlMiddleware),
}));

vi.mock('@/lib/supabase/proxy', () => ({
  updateSession: vi.fn(),
}));

const createRequest = (url: string) => new NextRequest(url);

const createSessionResponse = () => {
  const response = NextResponse.next();
  response.cookies.set('session', 'updated');
  return response;
};

describe('app proxy private route protection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.intlMiddleware.mockReturnValue(NextResponse.next());
  });

  it('returns 401 and points guests from private routes to the localized main page', async () => {
    vi.mocked(updateSession).mockResolvedValue({
      supabaseResponse: createSessionResponse(),
      isLoggedIn: false,
    } as Awaited<ReturnType<typeof updateSession>>);

    const response = await proxy(createRequest('https://example.com/ru/history'));
    const body = await response.text();

    expect(response.status).toBe(401);
    expect(response.headers.get('location')).toBe('https://example.com/ru');
    expect(response.headers.get('set-cookie')).toContain('session=updated');
    expect(body).toContain('window.location.replace("https://example.com/ru")');
    expect(mocks.intlMiddleware).not.toHaveBeenCalled();
  });

  it('redirects authenticated users away from auth routes to the main page', async () => {
    vi.mocked(updateSession).mockResolvedValue({
      supabaseResponse: createSessionResponse(),
      isLoggedIn: true,
    } as Awaited<ReturnType<typeof updateSession>>);

    const response = await proxy(createRequest('https://example.com/en/sign-in'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://example.com/en');
    expect(response.headers.get('set-cookie')).toContain('session=updated');
  });

  it('passes public routes through next-intl middleware', async () => {
    vi.mocked(updateSession).mockResolvedValue({
      supabaseResponse: createSessionResponse(),
      isLoggedIn: false,
    } as Awaited<ReturnType<typeof updateSession>>);

    const response = await proxy(createRequest('https://example.com/en/about'));

    expect(response.status).toBe(200);
    expect(response.headers.get('set-cookie')).toContain('session=updated');
    expect(mocks.intlMiddleware).toHaveBeenCalledTimes(1);
  });
});
