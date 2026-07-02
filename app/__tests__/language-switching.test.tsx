import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import LanguageSwitcher from '@/app/components/LanguageSwitcher';

const mocks = vi.hoisted(() => ({
  locale: 'en',
  pathname: '/',
  routerReplace: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useLocale: () => mocks.locale,
}));

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({
    replace: mocks.routerReplace,
  }),
}));

describe('Language switching', () => {
  beforeEach(() => {
    mocks.locale = 'en';
    mocks.pathname = '/';
    mocks.routerReplace.mockClear();
  });

  it('switches the current pathname to the selected locale', () => {
    mocks.pathname = '/about';

    render(<LanguageSwitcher />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'ru' } });

    expect(mocks.routerReplace).toHaveBeenCalledWith({ pathname: '/about' }, { locale: 'ru' });
  });
});
