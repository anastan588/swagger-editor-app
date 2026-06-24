import Image from 'next/image';
import { useTranslations } from 'next-intl';

import LanguageSwitcher from '@/app/components/LanguageSwitcher';

export default function Home() {
  const t = useTranslations('HomePage');
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image priority alt="Next.js logo" className="dark:invert" height={20} src="/next.svg" width={100} />
        <h1>{t('title')}</h1>
        <LanguageSwitcher />
      </main>
    </div>
  );
}
