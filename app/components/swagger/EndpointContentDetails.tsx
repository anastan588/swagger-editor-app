'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

import { ResponseContentSpec } from './types';

interface EndpointContentDetailsProps {
  content?: Record<string, ResponseContentSpec>;
}

const stringifyDetail = (value: unknown) => {
  if (typeof value === 'string') {
    return value;
  }

  return JSON.stringify(value, null, 2);
};

const extractExample = (contentSpec: ResponseContentSpec) => {
  if ('example' in contentSpec) {
    return contentSpec.example;
  }

  const firstExample = Object.values(contentSpec.examples ?? {})[0];
  if (firstExample && typeof firstExample === 'object' && 'value' in firstExample) {
    return firstExample.value;
  }

  return firstExample;
};

export const EndpointContentDetails: React.FC<EndpointContentDetailsProps> = ({ content }) => {
  const t = useTranslations('EditorPage.EndpointRow');
  const entries = Object.entries(content ?? {});

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map(([contentType, contentSpec]) => {
        const example = extractExample(contentSpec);

        return (
          <div
            key={contentType}
            className="flex flex-col gap-2 rounded-xs border border-neutral-200/70 bg-white p-3 text-xs dark:border-neutral-800 dark:bg-zinc-900/60"
          >
            <div className="font-mono text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
              {t('contentType')}: {contentType}
            </div>

            {contentSpec.schema ? (
              <div className="flex flex-col gap-1">
                <span className="font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  {t('schema')}
                </span>
                <pre className="max-h-44 overflow-auto whitespace-pre-wrap rounded-xs bg-neutral-50 p-2 font-mono text-[11px] leading-relaxed text-neutral-700 dark:bg-zinc-950 dark:text-neutral-300">
                  {stringifyDetail(contentSpec.schema)}
                </pre>
              </div>
            ) : null}

            {example !== undefined ? (
              <div className="flex flex-col gap-1">
                <span className="font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  {t('example')}
                </span>
                <pre className="max-h-44 overflow-auto whitespace-pre-wrap rounded-xs bg-neutral-50 p-2 font-mono text-[11px] leading-relaxed text-neutral-700 dark:bg-zinc-950 dark:text-neutral-300">
                  {stringifyDetail(example)}
                </pre>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
