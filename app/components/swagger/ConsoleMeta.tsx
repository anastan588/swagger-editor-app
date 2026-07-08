'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

import { ResponseState } from './types';

interface ConsoleMetaProps {
  responseState: ResponseState;
  responseType: string;
  bodyFormat: 'json' | 'yaml';
  setBodyFormat: (format: 'json' | 'yaml') => void;
  activeTab: 'body' | 'headers';
}

export const ConsoleMeta: React.FC<ConsoleMetaProps> = ({
  responseState,
  responseType,
  bodyFormat,
  setBodyFormat,
  activeTab,
}) => {
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
      {activeTab === 'body' && responseType === 'json' ? (
        <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded-xs overflow-hidden bg-neutral-50 dark:bg-zinc-900 text-[10px] uppercase font-sans select-none font-semibold">
          <button
            className={`px-2 py-1 transition-colors ${
              bodyFormat === 'json'
                ? 'bg-neutral-900 dark:bg-zinc-100 text-white dark:text-zinc-950'
                : 'text-neutral-400 hover:text-neutral-600'
            }`}
            type="button"
            onClick={() => setBodyFormat('json')}
          >
            JSON
          </button>
          <button
            className={`px-2 py-1 transition-colors ${
              bodyFormat === 'yaml'
                ? 'bg-neutral-900 dark:bg-zinc-100 text-white dark:text-zinc-950'
                : 'text-neutral-400 hover:text-neutral-600'
            }`}
            type="button"
            onClick={() => setBodyFormat('yaml')}
          >
            YAML
          </button>
        </div>
      ) : null}
    </div>
  );
};
