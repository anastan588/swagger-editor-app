import { getTranslations } from 'next-intl/server';

const HistoryLoading = async () => {
  const t = await getTranslations('HistoryPage');

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-16 text-center">
      <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-foreground" />
      <p className="mt-4 text-sm text-muted-foreground">{t('loading')}</p>
    </section>
  );
};

export default HistoryLoading;
