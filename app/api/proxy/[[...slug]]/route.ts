import { NextRequest, NextResponse } from 'next/server';

import { ProxyBodyPayload } from '@/app/components/swagger/types';
import { updateSession } from '@/lib/supabase/proxy';

type SupabaseClient = Awaited<ReturnType<typeof updateSession>>['supabase'];

interface TrackRequestHistoryOptions {
  supabase: SupabaseClient;
  userId: string;
  method: string;
  path: string;
  targetHost: string;
  requestBody: BodyInit | null | undefined;
  responseStatus: number;
  responseBodyText: string;
  latencyMs: number;
  errorDetails: string | null;
}

const trackRequestHistory = async ({
  supabase,
  userId,
  method,
  path,
  targetHost,
  requestBody,
  responseStatus,
  responseBodyText,
  latencyMs,
  errorDetails,
}: TrackRequestHistoryOptions): Promise<void> => {
  const encoder = new TextEncoder();
  const requestBodyText = typeof requestBody === 'string' ? requestBody : '';

  await supabase
    .from('request_history')
    .insert({
      user_id: userId,
      method: method.toUpperCase(),
      path,
      target_host: targetHost,
      request_size_bytes: encoder.encode(requestBodyText).length,
      response_status: responseStatus,
      response_size_bytes: encoder.encode(responseBodyText).length,
      latency_ms: latencyMs,
      error_details: errorDetails,
      created_at: new Date().toISOString(),
    })
    .then(undefined, () => undefined);
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { isLoggedIn, userId, supabase } = await updateSession(request);

    const schemaTargetBase = request.headers.get('X-Proxy-Target-Base') || '';
    const urlEncodedMock = request.headers.get('X-Proxy-Mock-Fallback') || '';
    let clientMockFallback = '';

    if (urlEncodedMock) {
      try {
        clientMockFallback = decodeURIComponent(urlEncodedMock);
      } catch {
        clientMockFallback = '';
      }
    }

    const payload = (await request.json()) as ProxyBodyPayload;
    const { url: requestPath, method, headers, body } = payload;

    if (!requestPath) {
      return NextResponse.json({ error: 'Target request path is missing' }, { status: 400 });
    }

    const cleanBase = schemaTargetBase.replace(/\/$/, '');
    const cleanPath = requestPath.startsWith('/') ? requestPath : `/${requestPath}`;
    const finalDestinationUrl = `${cleanBase}${cleanPath}`;

    const cleanHeaders: Record<string, string> = {};
    Object.entries(headers || {}).forEach(([key, val]) => {
      if (
        ![
          'host',
          'origin',
          'referer',
          'x-proxy-target-base',
          'x-track-session',
          'x-proxy-mock-fallback',
          'content-length',
        ].includes(key.toLowerCase())
      ) {
        cleanHeaders[key] = val;
      }
    });

    const fetchOptions: RequestInit = {
      method: method.toUpperCase(),
      headers: cleanHeaders,
      body: ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase()) ? body : undefined,
      signal: AbortSignal.timeout(4000),
    };

    let targetResponse: Response;
    let responseBodyText = '';
    let usedMockFallback = false;
    let proxyStatus = 200;
    let networkErrorDetails: string | null = null;
    const requestStartedAt = performance.now();
    try {
      targetResponse = await fetch(finalDestinationUrl, fetchOptions);
      responseBodyText = await targetResponse.text();
      proxyStatus = targetResponse.status;
    } catch (networkError: unknown) {
      networkErrorDetails = networkError instanceof Error ? networkError.message : 'Network request failed';
      if (clientMockFallback) {
        responseBodyText = clientMockFallback;
        networkErrorDetails = `${networkErrorDetails} (schema mock fallback used)`;
      } else {
        responseBodyText = JSON.stringify(
          {
            message: 'Remote server is unreachable, and no structural examples were provided in the API schema.',
            path: cleanPath,
          },
          null,
          2,
        );
      }
      usedMockFallback = true;
      proxyStatus = 200;
    }
    const durationMs = Math.round(performance.now() - requestStartedAt);

    const responseHeaders: Record<string, string> = {};
    if (!usedMockFallback && targetResponse!) {
      targetResponse.headers.forEach((value: string, key: string) => {
        responseHeaders[key] = value;
      });
    } else {
      responseHeaders['content-type'] = 'application/json';
      responseHeaders['x-dynamic-mock-active'] = 'true';
    }

    if (isLoggedIn && userId) {
      await trackRequestHistory({
        supabase,
        userId,
        method,
        path: cleanPath,
        targetHost: cleanBase,
        requestBody: fetchOptions.body,
        responseStatus: proxyStatus,
        responseBodyText,
        latencyMs: durationMs,
        errorDetails: networkErrorDetails,
      });
    }

    return NextResponse.json({
      status: proxyStatus,
      headers: responseHeaders,
      body: responseBodyText,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected proxy exception occurred';
    return NextResponse.json(
      {
        status: 500,
        headers: {},
        body: JSON.stringify({ error: errorMessage }),
      },
      { status: 500 },
    );
  }
}
