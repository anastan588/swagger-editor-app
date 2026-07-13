'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

import { EndpointContentDetails } from './EndpointContentDetails';
import { OperationSpec } from './types';

interface EndpointResponsesProps {
  responses: OperationSpec['responses'];
}

export const EndpointResponses: React.FC<EndpointResponsesProps> = ({ responses }) => {
  const t = useTranslations('EditorPage.EndpointRow');

  if (!responses) return null;

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
        {t('responsesMatrix')}
      </h4>
      <div className="flex flex-col gap-1.5">
        {Object.entries(responses).map(([code, responseSpec]) => (
          <div
            key={code}
            className="flex flex-col gap-2 rounded-xs border border-neutral-200/40 bg-neutral-100/40 p-2 text-xs dark:border-neutral-800/20 dark:bg-neutral-800/10"
          >
            <div className="flex items-center gap-4 font-mono">
              <span
                className={`font-bold ${code.startsWith('2') ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-500'}`}
              >
                {code}
              </span>
              <span className="font-sans text-[11px] text-neutral-600 dark:text-neutral-400">
                {responseSpec.description}
              </span>
            </div>
            <EndpointContentDetails content={responseSpec.content} />
          </div>
        ))}
      </div>
    </div>
  );
};
