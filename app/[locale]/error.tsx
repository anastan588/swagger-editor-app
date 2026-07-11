'use client';

import { useTranslations } from 'next-intl';

type ErrorPageProps = {
  unstable_retry: () => void;
};

const ErrorPage = ({ unstable_retry }: ErrorPageProps) => {
  const t = useTranslations('ErrorPage');

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <section className="max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
        <button
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
          type="button"
          onClick={() => unstable_retry()}
        >
          {t('tryAgain')}
        </button>
      </section>
    </main>
  );
};

export default ErrorPage;
