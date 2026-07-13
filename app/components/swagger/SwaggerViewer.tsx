'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

import { useSchema } from '@/app/context/SchemaContextValue';
import { useSwaggerViewer } from '@/app/hooks/useSwaggerViewer';
import { Input } from '@/components/ui/input';

import { EndpointRow } from './EndpointRow';

export const SwaggerViewer: React.FC = () => {
  const t = useTranslations('EditorPage.SwaggerViewer');
  const { format } = useSchema();

  const {
    isValid,
    parsedObject,
    endpoints,
    copiedId,
    activeInputs,
    requestBodies,
    responses,
    manualBaseUrl,
    computedBaseUrl,
    setManualBaseUrl,
    handleInputChange,
    handleBodyChange,
    handleGenerateCurl,
    handleExecuteRequest,
  } = useSwaggerViewer();

  return (
    <div className="h-full bg-white dark:bg-zinc-950 rounded-sm border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-auto p-6 transition-colors duration-200">
      {isValid && parsedObject ? (
        <div className="flex flex-col gap-6">
          <div className="p-4 bg-neutral-50 dark:bg-zinc-900/40 border border-neutral-200 dark:border-neutral-800/80 rounded-sm text-xs flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-medium text-neutral-700 dark:text-neutral-400">{t('serverTargetHost')}</span>
              <span className="self-start sm:self-auto px-2 py-0.5 uppercase tracking-wider text-[10px] font-bold bg-neutral-200 dark:bg-zinc-800 text-neutral-600 dark:text-neutral-400 rounded-sm">
                {t('detected', { format: format.toUpperCase() })}
              </span>
            </div>
            <Input
              className="w-full p-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-zinc-900 rounded-sm text-neutral-800 dark:text-neutral-200 outline-none focus:border-neutral-400"
              placeholder={computedBaseUrl || t('placeholderHost')}
              type="text"
              value={manualBaseUrl}
              onChange={(e) => setManualBaseUrl(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-4">
            {endpoints.map((ep) => (
              <EndpointRow
                key={ep.id}
                copiedId={copiedId}
                endpoint={ep}
                inputs={activeInputs[ep.id] || {}}
                requestBody={requestBodies[ep.id] || ''}
                responseState={responses[ep.id]}
                onBodyChange={(val) => handleBodyChange(ep.id, val)}
                onExecute={() => handleExecuteRequest(ep)}
                onGenerateCurl={() => handleGenerateCurl(ep)}
                onInputChange={(param, val) => handleInputChange(ep.id, param, val)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-neutral-400 dark:text-neutral-500 gap-3 text-center p-6">
          <div className="w-10 h-10 rounded-full border-2 border-dashed border-neutral-200 dark:border-neutral-800 animate-spin" />
          <p className="text-xs font-light max-w-xs leading-relaxed">{t('awaitingConfig')}</p>
        </div>
      )}
    </div>
  );
};
