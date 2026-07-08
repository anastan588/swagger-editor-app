'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

import { ResponseState } from './types';

interface ConsoleMetaProps {
  responseState: ResponseState;
  responseType: string;
}

export const ConsoleMeta: React.FC<ConsoleMetaProps> = ({ responseState, responseType }) => {
  const t = useTranslations('EditorPage.ResponseConsole');
  const isSuccess = responseState.status >= 200 && responseState.status < 300;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-neutral-400 dark:text-neutral-500 font-sans font-medium">{t('diagnostics')}</span>
        <span
          className={`px-2 py-0.5 rounded-xs font-bold border ${
            isSuccess
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/40'
              : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-800/40'
          }`}
        >
          Code {responseState.status}
        </span>
        {responseState.latency !== undefined ? (
          <span className="px-2 py-0.5 bg-neutral-100 dark:bg-zinc-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200/40 dark:border-neutral-700/40 rounded-xs">
            {t('latency', { ms: responseState.latency })}
          </span>
        ) : null}
        {responseState.size ? (
          <span className="px-2 py-0.5 bg-neutral-100 dark:bg-zinc-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200/40 dark:border-neutral-700/40 rounded-xs">
            {t('length', { size: responseState.size })}
          </span>
        ) : null}
        <span className="px-2 py-0.5 bg-neutral-50 dark:bg-zinc-900 text-neutral-500 dark:text-neutral-400 border border-neutral-200/20 dark:border-neutral-800/20 rounded-xs uppercase text-[10px]">
          {t('type', { type: responseType })}
        </span>
      </div>
    </div>
  );
};
