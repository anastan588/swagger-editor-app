'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export const EditorSkeleton: React.FC = () => {
  const t = useTranslations('EditorPage.EditorSkeleton');

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-neutral-800 rounded-sm overflow-hidden shadow-sm animate-pulse min-h-0 relative">
      <div className="h-11 bg-neutral-50 dark:bg-zinc-900 border-b border-neutral-200 dark:border-neutral-800 w-full" />
      <div className="flex-1 bg-white dark:bg-black w-full flex flex-col items-center justify-center gap-3 text-center p-6">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-200 dark:border-neutral-800 border-t-black dark:border-t-white" />
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            {t('loadingTitle')}
          </p>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-600 font-light max-w-[240px] leading-relaxed">
            {t('loadingDescription')}
          </p>
        </div>
      </div>
      <div className="h-14 bg-neutral-50 dark:bg-zinc-900/50 border-t border-neutral-200 dark:border-neutral-800 w-full" />
    </div>
  );
};
