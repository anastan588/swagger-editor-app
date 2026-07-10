import { NextRequest, NextResponse } from 'next/server';

import { ProxyBodyPayload } from '@/app/components/swagger/types';
import { updateSession } from '@/lib/supabase/proxy';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { isLoggedIn } = await updateSession(request);

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

    try {
      targetResponse = await fetch(finalDestinationUrl, fetchOptions);
      responseBodyText = await targetResponse.text();
      proxyStatus = targetResponse.status;
    } catch {
      if (clientMockFallback) {
        responseBodyText = clientMockFallback;
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

    const responseHeaders: Record<string, string> = {};
    if (!usedMockFallback && targetResponse!) {
      targetResponse.headers.forEach((value: string, key: string) => {
        responseHeaders[key] = value;
      });
    } else {
      responseHeaders['content-type'] = 'application/json';
      responseHeaders['x-dynamic-mock-active'] = 'true';
    }

    if (isLoggedIn) {
      try {
        console.log(
          `[TRACKING LOG] ${method} -> ${finalDestinationUrl} [Status: ${proxyStatus}] (Dynamic Mocked: ${usedMockFallback})`,
        );
      } catch (trackError: unknown) {
        console.error('History tracking error:', trackError);
      }
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
