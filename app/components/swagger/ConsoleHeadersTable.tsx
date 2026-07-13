'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

interface ConsoleHeadersTableProps {
  headers: Record<string, string>;
}

export const ConsoleHeadersTable: React.FC<ConsoleHeadersTableProps> = ({ headers }) => {
  const t = useTranslations('EditorPage.ResponseConsole');
  const entries = Object.entries(headers || {});

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-sm overflow-hidden bg-white dark:bg-zinc-900/20 shadow-xs">
      <table className="w-full text-left font-mono text-xs border-collapse">
        <thead>
          <tr className="bg-neutral-50 dark:bg-zinc-900/60 text-neutral-400 dark:text-neutral-500 border-b border-neutral-200 dark:border-neutral-800 text-[11px] uppercase tracking-wider">
            <th className="p-2 pl-3 font-bold">{t('thField')}</th>
            <th className="p-2 font-bold">{t('thValue')}</th>
          </tr>
        </thead>
        <tbody>
          {entries.length > 0 ? (
            entries.map(([key, val]) => (
              <tr
                key={key}
                className="border-b border-neutral-100 dark:border-neutral-800/40 last:border-0 hover:bg-neutral-50/40 dark:hover:bg-zinc-900/30 transition-colors"
              >
                <td className="p-2 pl-3 font-bold text-neutral-500 dark:text-neutral-400 select-all truncate max-w-50">
                  {key}
                </td>
                <td className="p-2 text-neutral-700 dark:text-neutral-300 break-all select-all leading-normal">
                  {val}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="p-4 text-center text-neutral-400 dark:text-neutral-500 italic" colSpan={2}>
                {t('noHeaders')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
