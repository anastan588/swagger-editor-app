import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { RequestHistoryData } from '@/app/components/swagger/types';
import { createClient } from '@/lib/supabase/server';

const HistoryView = dynamic(() => import('./HistoryView'));

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const { data } = await supabase
    .from('request_history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const entries = (data ?? []) as RequestHistoryData[];
  const t = await getTranslations('HistoryPage');

  const translations = {
    title: t('title'),
    emptyDescription: t('emptyDescription'),
    goToEditor: t('goToEditor'),
    goToViewer: t('goToViewer'),
    statusCode: t('statusCode'),
    latency: t('latency'),
    requestSize: t('requestSize'),
    responseSize: t('responseSize'),
    error: t('error'),
  };

  return <HistoryView entries={entries} translations={translations} />;
}
