'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { useAuth } from '@/app/components/useAuth';
import { useRouter } from '@/i18n/navigation';

const HistoryPage = () => {
  const t = useTranslations('HistoryPage');
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
    </section>
  );
};

export default HistoryPage;
