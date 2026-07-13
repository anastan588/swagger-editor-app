'use client';

import { ChangeEvent, useTransition } from 'react';
import { useLocale } from 'next-intl';

import { usePathname, useRouter } from '@/i18n/navigation';

export const LanguageSwitcher = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = event.target.value;

    startTransition(() => {
      router.replace({ pathname }, { locale: nextLocale });
    });
  };

  return (
    <select className="border rounded p-1" defaultValue={locale} disabled={isPending} onChange={handleLanguageChange}>
      <option value="en">English</option>
      <option value="ru">Russian</option>
    </select>
  );
};

export default LanguageSwitcher;
