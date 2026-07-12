'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';

import { EndpointContentDetails } from './EndpointContentDetails';
import { EndpointHeader } from './EndpointHeader';
import { EndpointParameters } from './EndpointParameters';
import { EndpointResponses } from './EndpointResponses';
import { ResponseConsole } from './ResponseConsole';
import { EndpointRowProps } from './types';

export const EndpointRow: React.FC<EndpointRowProps> = ({
  endpoint,
  inputs,
  requestBody,
  responseState,
  copiedId,
  onInputChange,
  onBodyChange,
  onExecute,
  onGenerateCurl,
}) => {
  const t = useTranslations('EditorPage.EndpointRow');
  const methodUpper = endpoint.method.toUpperCase();
  const isWriteMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(methodUpper);

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-sm overflow-hidden text-sm bg-neutral-50/30 dark:bg-zinc-900/10 transition-colors duration-200">
      <EndpointHeader method={endpoint.method} path={endpoint.path} summary={endpoint.spec.summary} />

      <div className="p-4 flex flex-col gap-4">
        {endpoint.spec.parameters && endpoint.spec.parameters.length > 0 ? (
          <EndpointParameters inputs={inputs} parameters={endpoint.spec.parameters} onInputChange={onInputChange} />
        ) : null}

        {isWriteMethod ? (
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              {t('requestBodySchema')}
            </h4>
            <EndpointContentDetails content={endpoint.spec.requestBody?.content} />
            <textarea
              className="w-full p-3 font-mono text-xs border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-zinc-900 text-neutral-800 dark:text-neutral-200 rounded-xs outline-none focus:ring-1 focus:ring-neutral-400 resize-y leading-relaxed shadow-inner"
              placeholder={'{\n  "property": "value"\n}'}
              rows={5}
              value={requestBody}
              onChange={(e) => onBodyChange(e.target.value)}
            />
          </div>
        ) : null}

        <EndpointResponses responses={endpoint.spec.responses} />

        <div className="flex items-center gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
          <Button
            className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-medium rounded-xs text-xs transition-colors disabled:opacity-50 select-none shadow-xs"
            disabled={responseState?.loading}
            onClick={onExecute}
          >
            {responseState?.loading ? t('executing') : t('executeRequest')}
          </Button>
          <Button
            className="px-4 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-neutral-700 dark:text-zinc-300 font-medium rounded-xs text-xs transition-colors select-none"
            onClick={onGenerateCurl}
          >
            {copiedId === endpoint.id ? t('copied') : t('generateCurl')}
          </Button>
        </div>

        {responseState && !responseState.loading ? <ResponseConsole responseState={responseState} /> : null}
      </div>
    </div>
  );
};
