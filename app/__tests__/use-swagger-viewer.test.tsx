import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FlattenedEndpoint } from '@/app/components/swagger/types';
import { useSwaggerViewer } from '@/app/hooks/useSwaggerViewer';
import * as ParserUtils from '@/app/utils/SwaggerViewerParser';

interface SchemaContextState {
  schema: string;
  isValid: boolean;
  format: string;
}

interface AuthContextState {
  isAuthenticated: boolean;
}

interface SupabaseUser {
  id: string;
}

interface SupabaseAuthResponse {
  data: {
    user: SupabaseUser | null;
  };
}

const mockSchemaContext = vi.fn<() => SchemaContextState>();
vi.mock('@/app/context/SchemaContext', () => ({
  useSchema: () => mockSchemaContext(),
}));

const mockAuthContext: AuthContextState = { isAuthenticated: true };
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useContext: (context: unknown) => {
      if (context && typeof context === 'object' && 'Provider' in context) {
        return actual.useContext(context as React.Context<unknown>);
      }
      return mockAuthContext;
    },
  };
});

const supabaseMocks = vi.hoisted(() => ({
  getUser: vi.fn<() => Promise<SupabaseAuthResponse>>(),
  insert: vi.fn<(_data: Record<string, unknown>) => Promise<{ error: unknown }>>(),
  from: vi.fn(),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: supabaseMocks.getUser,
    },
    from: supabaseMocks.from,
  }),
}));

describe('useSwaggerViewer', () => {
  const fakeEndpoints: FlattenedEndpoint[] = [
    { id: 'get-/users', path: '/users', method: 'get', spec: { parameters: [], responses: {} } },
  ];

  const mockFetch = vi.fn();
  const writeTextMock = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.stubGlobal('fetch', mockFetch);

    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
    });

    vi.spyOn(JSON, 'parse').mockImplementation(() => ({ openapi: '3.0.0' }));
    vi.spyOn(ParserUtils, 'parseYamlSchema').mockImplementation(() => ({ openapi: '3.0.0' }));
    vi.spyOn(ParserUtils, 'extractBaseUrl').mockImplementation(() => 'https://computed.com');
    vi.spyOn(ParserUtils, 'flattenEndpoints').mockImplementation(() => fakeEndpoints);
    vi.spyOn(ParserUtils, 'compileRequestDetails').mockImplementation(() => ({
      fullAbsoluteUrl: 'https://computed.com',
      cleanPathWithQuery: '/users',
      headers: { 'X-Test': 'true' },
    }));
    vi.spyOn(ParserUtils, 'generateCurlCommand').mockImplementation(() => 'curl command string');

    mockSchemaContext.mockReturnValue({ schema: '{"openapi": "3.0.0"}', isValid: true, format: 'json' });
    mockAuthContext.isAuthenticated = true;

    supabaseMocks.getUser.mockResolvedValue({ data: { user: { id: 'user_123' } } });
    supabaseMocks.from.mockReturnValue({ insert: supabaseMocks.insert });
    supabaseMocks.insert.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes hooks with default core structures matching configurations state', () => {
    const { result } = renderHook(() => useSwaggerViewer());

    expect(result.current.isValid).toBe(true);
    expect(result.current.endpoints).toEqual(fakeEndpoints);
    expect(result.current.manualBaseUrl).toBe('');
    expect(result.current.computedBaseUrl).toBe('https://computed.com');
  });

  it('updates manualBaseUrl when setManualBaseUrl trigger handler runs', () => {
    const { result } = renderHook(() => useSwaggerViewer());

    act(() => {
      result.current.setManualBaseUrl('https://custom-domain.com');
    });

    expect(result.current.manualBaseUrl).toBe('https://custom-domain.com');
  });

  it('stores active parameters inputs inside independent state dictionary matrices fields', () => {
    const { result } = renderHook(() => useSwaggerViewer());

    act(() => {
      result.current.handleInputChange('get-/users', 'limit', '10');
    });

    expect(result.current.activeInputs['get-/users']).toEqual({ limit: '10' });
  });

  it('stores mutating raw request body texts payloads schemas strings correctly', () => {
    const { result } = renderHook(() => useSwaggerViewer());

    act(() => {
      result.current.handleBodyChange('post-/users', '{"name": "test"}');
    });

    expect(result.current.requestBodies['post-/users']).toBe('{"name": "test"}');
  });

  it('should parse YAML schemas when YAML format is defined', () => {
    mockSchemaContext.mockReturnValue({
      schema: 'swagger: "2.0"',
      isValid: true,
      format: 'yaml',
    });

    const mockYamlObj = { openapi: '3.0.0' };
    vi.spyOn(ParserUtils, 'parseYamlSchema').mockReturnValue(mockYamlObj);

    const { result } = renderHook(() => useSwaggerViewer());

    expect(ParserUtils.parseYamlSchema).toHaveBeenCalledWith('swagger: "2.0"');
    expect(result.current.parsedObject).toEqual(mockYamlObj);
  });

  it('should write commands to clipboard and activate feedback tracking on curl generation', async () => {
    const { result } = renderHook(() => useSwaggerViewer());

    await act(async () => {
      result.current.handleGenerateCurl(fakeEndpoints[0]);
    });

    expect(writeTextMock).toHaveBeenCalledWith('curl command string');
    expect(result.current.copiedId).toBe('get-/users');

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.copiedId).toBeNull();
  });

  it('should invoke server side proxy endpoint and handle successful execution requests', async () => {
    const mockResponsePayload = {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: '{"success":true}',
    };

    mockFetch.mockResolvedValue({
      json: vi.fn().mockResolvedValue(mockResponsePayload),
    });

    const { result } = renderHook(() => useSwaggerViewer());

    await act(async () => {
      await result.current.handleExecuteRequest(fakeEndpoints[0]);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/proxy'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          url: '/users',
          method: 'get',
          headers: { 'X-Test': 'true' },
          body: undefined,
        }),
      }),
    );

    const finalResponse = result.current.responses['get-/users'];
    expect(finalResponse.status).toBe(200);
    expect(finalResponse.body).toBe('{"success":true}');
    expect(finalResponse.loading).toBe(false);
    expect(finalResponse.latency).toBeDefined();
  });

  it('should fail gracefully and produce explicit exception responses when the proxy stack rejects', async () => {
    mockFetch.mockRejectedValue(new Error('Proxy crashed'));

    const { result } = renderHook(() => useSwaggerViewer());

    await act(async () => {
      await result.current.handleExecuteRequest(fakeEndpoints[0]);
    });

    const errorState = result.current.responses['get-/users'];
    expect(errorState.status).toBe(500);
    expect(errorState.body).toContain('Proxy crashed');
    expect(errorState.loading).toBe(false);
  });
});
