import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { routing } from './i18n/routing';
import { updateSession } from './lib/supabase/proxy';

const intlMiddleware = createMiddleware(routing);

const privateRoutes = ['/history'];
const authRoutes = ['/sign-in', '/sign-up'];

const copySessionCookies = (targetResponse: NextResponse, sessionResponse: NextResponse) => {
  sessionResponse.cookies.getAll().forEach((cookie) => {
    targetResponse.cookies.set(cookie.name, cookie.value);
  });

  return targetResponse;
};

const createUnauthorizedRedirectResponse = (redirectUrl: URL, sessionResponse: NextResponse) => {
  const redirectTarget = redirectUrl.toString();
  const safeRedirectTarget = redirectTarget.replace(/"/g, '&quot;');
  const body = `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${safeRedirectTarget}"></head><body><script>window.location.replace(${JSON.stringify(redirectTarget)});</script></body></html>`;

  const unauthorizedResponse = new NextResponse(body, {
    status: 401,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      location: redirectTarget,
    },
  });

  return copySessionCookies(unauthorizedResponse, sessionResponse);
};

export async function proxy(request: NextRequest) {
  const { supabaseResponse, isLoggedIn } = await updateSession(request);

  const pathname = request.nextUrl.pathname;
  const pathnameWithoutLocale = pathname.replace(/^\/(en|ru)/, '') || '/';
  const locale = pathname.match(/^\/(en|ru)(?:\/|$)/)?.[1] || routing.defaultLocale;

  if (!isLoggedIn && privateRoutes.some((r) => pathnameWithoutLocale.startsWith(r))) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${locale}`;
    redirectUrl.search = '';
    return createUnauthorizedRedirectResponse(redirectUrl, supabaseResponse);
  }

  if (isLoggedIn && authRoutes.some((r) => pathnameWithoutLocale.startsWith(r))) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${locale}`;
    return copySessionCookies(NextResponse.redirect(redirectUrl), supabaseResponse);
  }

  const intlResponse = intlMiddleware(request);

  return copySessionCookies(intlResponse, supabaseResponse);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
