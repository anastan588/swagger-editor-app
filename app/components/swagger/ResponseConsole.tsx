'use client';

import React, { useMemo, useState } from 'react';
import { Check, Code2, Copy, FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { stringifyToYaml } from '@/app/utils/SwaggerViewerParser';
import { Button } from '@/components/ui/button';

import { ConsoleHeadersTable } from './ConsoleHeadersTable';
import { ConsoleMeta } from './ConsoleMeta';
import { JSONBeautifier } from './JSONBeautifier';
import { ResponseState } from './types';

interface ResponseConsoleProps {
  responseState: ResponseState;
}

export const ResponseConsole: React.FC<ResponseConsoleProps> = ({ responseState }) => {
  const t = useTranslations('EditorPage.ResponseConsole');
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body');
  const [bodyFormat] = useState<'json' | 'yaml'>('json');
  const [copied, setCopied] = useState(false);

  const responseType = useMemo<'json' | 'html' | 'text'>(() => {
    const contentType =
      Object.entries(responseState.headers)
        .find(([key]) => key.toLowerCase() === 'content-type')?.[1]
        ?.toLowerCase() || '';

    if (contentType.includes('application/json') || contentType.includes('text/json')) {
      return 'json';
    }
    if (contentType.includes('text/html') || responseState.body.trim().startsWith('<')) {
      return 'html';
    }
    return 'text';
  }, [responseState.headers, responseState.body]);

  const yamlBodyContent = useMemo<string>(() => {
    if (responseType !== 'json' || !responseState.body.trim()) return '';
    try {
      const parsedJson = JSON.parse(responseState.body);
      return stringifyToYaml(parsedJson);
    } catch {
      return t('yamlError');
    }
  }, [responseType, responseState.body, t]);

  const handleCopy = () => {
    const textToCopy = activeTab === 'body' && bodyFormat === 'yaml' ? yamlBodyContent : responseState.body;
    if (!textToCopy.trim()) return;

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  };

  return (
    <div className="mt-2 border-t border-neutral-200 dark:border-neutral-800 pt-4 flex flex-col gap-3">
      <ConsoleMeta responseState={responseState} responseType={responseType} />
      {responseState.requestUrl ? (
        <div className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 break-all bg-neutral-50 dark:bg-zinc-900/30 p-2 rounded-xs border border-neutral-100 dark:border-neutral-800/40 select-all">
          <span className="font-bold mr-1.5 text-neutral-500 dark:text-neutral-400 font-sans">{t('tracer')}</span>
          {responseState.requestUrl}
        </div>
      ) : null}

      <div className="flex border-b border-neutral-200 dark:border-neutral-800 text-xs select-none">
        <Button
          className={`px-3 py-1.5 font-medium border-b-2 -mb-[1px] transition-colors duration-150 flex items-center gap-1.5 bg-transparent shadow-none hover:bg-transparent rounded-none h-auto ${
            activeTab === 'body'
              ? 'border-neutral-900 dark:border-zinc-100 text-neutral-900 dark:text-zinc-100'
              : 'border-transparent text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
          }`}
          type="button"
          onClick={() => setActiveTab('body')}
        >
          <Code2 className="w-3.5 h-3.5" />
          {t('bodyTab')}
        </Button>
        <Button
          className={`px-3 py-1.5 font-medium border-b-2 -mb-[1px] transition-colors duration-150 flex items-center gap-1.5 bg-transparent shadow-none hover:bg-transparent rounded-none h-auto ${
            activeTab === 'headers'
              ? 'border-neutral-900 dark:border-zinc-100 text-neutral-900 dark:text-zinc-100'
              : 'border-transparent text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
          }`}
          type="button"
          onClick={() => setActiveTab('headers')}
        >
          <FileText className="w-3.5 h-3.5" />
          {t('headersTab', { count: Object.keys(responseState.headers || {}).length })}
        </Button>
      </div>

      {activeTab === 'body' ? (
        <div className="relative bg-neutral-100 dark:bg-zinc-900 rounded-sm border border-neutral-200 dark:border-neutral-800 shadow-inner">
          <Button
            className={`absolute right-3 top-3 px-2.5 py-1 h-7 text-[11px] font-semibold border rounded-xs shadow-xs transition-all duration-150 select-none z-30 flex items-center gap-1.5 opacity-90 hover:opacity-100 ${
              copied
                ? 'bg-emerald-600 border-emerald-600 text-white dark:bg-emerald-500 dark:border-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-500'
                : 'bg-white dark:bg-zinc-800 text-neutral-700 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700 active:bg-neutral-50 dark:active:bg-zinc-700 hover:bg-neutral-50 dark:hover:bg-zinc-700'
            }`}
            type="button"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                {t('copied')}
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                {t('copy')}
              </>
            )}
          </Button>
          <div className="p-4 pt-12 overflow-auto max-h-96 w-full">
            {responseState.body.trim().length === 0 ? (
              <span className="text-neutral-400 dark:text-neutral-500 italic text-xs">{t('noBody')}</span>
            ) : responseType === 'json' ? (
              bodyFormat === 'json' ? (
                <JSONBeautifier rawJson={responseState.body} />
              ) : (
                <pre className="font-mono text-xs text-neutral-700 dark:text-neutral-300 whitespace-pre leading-relaxed select-all">
                  {yamlBodyContent}
                </pre>
              )
            ) : (
              <pre className="font-mono text-xs text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap break-all select-all">
                {responseState.body}
              </pre>
            )}
          </div>
        </div>
      ) : (
        <ConsoleHeadersTable headers={responseState.headers} />
      )}
    </div>
  );
};
