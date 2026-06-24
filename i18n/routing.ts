import { defineRouting } from 'next-intl/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'ru'],
  // Used when no locale matches
  defaultLocale: 'en',
});
