'use client';

import React from 'react';

import { BADGE_THEMES, DEFAULT_BADGE } from './types';

interface EndpointHeaderProps {
  method: string;
  path: string;
  summary?: string;
}

export const EndpointHeader: React.FC<EndpointHeaderProps> = ({ method, path, summary }) => {
  const methodUpper = method.toUpperCase();
  const badgeClass = BADGE_THEMES[methodUpper] || DEFAULT_BADGE;

  return (
    <div className="p-3 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-zinc-900/40">
      <div className="flex items-center gap-3 font-mono font-medium">
        <span className={`px-2 py-0.5 text-xs font-bold border rounded-xs ${badgeClass}`}>{method}</span>
        <span className="text-neutral-800 dark:text-neutral-200 select-all">{path}</span>
      </div>
      <span className="text-xs text-neutral-400 dark:text-neutral-500 font-light max-w-xs truncate">{summary}</span>
    </div>
  );
};
