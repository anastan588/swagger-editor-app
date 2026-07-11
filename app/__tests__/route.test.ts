import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { POST } from '@/app/api/proxy/[[...slug]]/route';
import { updateSession } from '@/lib/supabase/proxy';

vi.mock('@/lib/supabase/proxy', () => ({
  updateSession: vi.fn(),
}));

function createMockRequest({ body, headers = {} }: { body: unknown; headers?: Record<string, string> }) {
  const url = 'http://localhost:3000/api/proxy';
  return new NextRequest(url, {
    method: 'POST',
    headers: new Headers(headers),
    body: JSON.stringify(body),
  });
}

describe('POST /api/proxy (Proxy Route Handler)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should return 400 if requestPath is missing in the payload', async () => {
    vi.mocked(updateSession).mockResolvedValue({
      isLoggedIn: true,
      userId: 'user_123',
      supabase: { from: vi.fn().mockReturnValue({ insert: vi.fn().mockResolvedValue({ error: null }) }) },
    } as never);
    vi.stubGlobal('fetch', vi.fn());

    const req = createMockRequest({ body: { method: 'GET', headers: {} } });
    const res = await POST(req);
    const json = (await res.json()) as Record<string, unknown>;

    expect(res.status).toBe(400);
    expect(json.error).toBe('Target request path is missing');
  });

  it('should successfully proxy the request, clean headers and record server-side analytics', async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: null });
    const fromMock = vi.fn().mockReturnValue({ insert: insertMock });

    vi.mocked(updateSession).mockResolvedValue({
      isLoggedIn: true,
      userId: 'user_123',
      supabase: { from: fromMock },
    } as never);

    const mockTargetResponse = new Response('{"success": true}', {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Custom-Header': 'value' },
    });
    const fetchSpy = vi.fn().mockResolvedValue(mockTargetResponse);
    vi.stubGlobal('fetch', fetchSpy);

    const req = createMockRequest({
      body: {
        url: '/users',
        method: 'POST',
        headers: { Host: 'forbidden.com', Authorization: 'Bearer token' },
        body: '{"name": "John"}',
      },
      headers: {
        'X-Proxy-Target-Base': 'https://api.example.com/',
      },
    });

    const res = await POST(req);
    const json = (await res.json()) as { status: number; body: string; headers: Record<string, string> };

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.example.com/users',
      expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'Bearer token' },
        body: '{"name": "John"}',
        signal: expect.any(AbortSignal),
      }),
    );

    expect(json.status).toBe(200);
    expect(json.body).toBe('{"success": true}');
    expect(json.headers['custom-header']).toBe('value');
    expect(console.log).not.toHaveBeenCalled();

    expect(fromMock).toHaveBeenCalledWith('request_history');
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user_123',
        method: 'POST',
        path: '/users',
        target_host: 'https://api.example.com',
        response_status: 200,
        request_size_bytes: '{"name": "John"}'.length,
        response_size_bytes: '{"success": true}'.length,
        error_details: null,
      }),
    );
  });

  it('should use clientMockFallback when fetch fails if it is provided', async () => {
    vi.mocked(updateSession).mockResolvedValue({
      isLoggedIn: true,
      userId: 'user_123',
      supabase: { from: vi.fn().mockReturnValue({ insert: vi.fn().mockResolvedValue({ error: null }) }) },
    } as never);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    const mockFallbackText = '{"mocked": true}';
    const req = createMockRequest({
      body: { url: '/data', method: 'GET', headers: {} },
      headers: {
        'X-Proxy-Target-Base': 'https://api.example.com',
        'X-Proxy-Mock-Fallback': encodeURIComponent(mockFallbackText),
      },
    });

    const res = await POST(req);
    const json = (await res.json()) as { status: number; body: string; headers: Record<string, string> };

    expect(json.status).toBe(200);
    expect(json.body).toBe(mockFallbackText);
    expect(json.headers['x-dynamic-mock-active']).toBe('true');
  });

  it('should return the standard error message when fetch fails if fallback is missing', async () => {
    vi.mocked(updateSession).mockResolvedValue({
      isLoggedIn: true,
      userId: 'user_123',
      supabase: { from: vi.fn().mockReturnValue({ insert: vi.fn().mockResolvedValue({ error: null }) }) },
    } as never);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    const req = createMockRequest({
      body: { url: '/data', method: 'GET', headers: {} },
      headers: { 'X-Proxy-Target-Base': 'https://api.example.com' },
    });

    const res = await POST(req);
    const json = (await res.json()) as { status: number; body: string };

    expect(json.status).toBe(200);
    const bodyObj = JSON.parse(json.body) as Record<string, unknown>;
    expect(bodyObj.message).toContain('Remote server is unreachable');
    expect(bodyObj.path).toBe('/data');
  });

  it('should correctly handle critical exceptions and return 500', async () => {
    vi.mocked(updateSession).mockRejectedValue(new Error('Database error'));

    const req = createMockRequest({ body: {} });
    const res = await POST(req);
    const json = (await res.json()) as { status: number; body: string };

    expect(res.status).toBe(500);
    expect(json.status).toBe(500);
    const bodyObj = JSON.parse(json.body) as Record<string, unknown>;
    expect(bodyObj.error).toBe('Database error');
  });
});
