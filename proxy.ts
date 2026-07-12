import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { routing } from './i18n/routing';
import { updateSession } from './lib/supabase/proxy';

const intlMiddleware = createMiddleware(routing);

const privateRoutes = ['/history'];
const authRoutes = ['/sign-in', '/sign-up'];

export async function proxy(request: NextRequest) {
  const { supabaseResponse, isLoggedIn } = await updateSession(request);

  const pathname = request.nextUrl.pathname;
  const pathnameWithoutLocale = pathname.replace(/^\/(en|ru)/, '') || '/';
  const locale = pathname.split('/')[1] || 'en';

  if (!isLoggedIn && privateRoutes.some((r) => pathnameWithoutLocale.startsWith(r))) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${locale}/sign-in`;
    return NextResponse.redirect(redirectUrl);
  }

  if (isLoggedIn && authRoutes.some((r) => pathnameWithoutLocale.startsWith(r))) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${locale}`;
    return NextResponse.redirect(redirectUrl);
  }

  const intlResponse = intlMiddleware(request);

  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  return intlResponse;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
