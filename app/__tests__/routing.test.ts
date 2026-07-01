import { describe, expect, it } from 'vitest';

import { generateStaticParams, routing } from '@/i18n/routing';

describe('Routing', () => {
  it('defines English and Russian locales with English as default', () => {
    expect(routing.locales).toEqual(['en', 'ru']);
    expect(routing.defaultLocale).toBe('en');
  });

  it('generates static params for every supported locale', () => {
    expect(generateStaticParams()).toEqual([{ locale: 'en' }, { locale: 'ru' }]);
  });
});
