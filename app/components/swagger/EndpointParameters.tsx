'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

import { ParameterSpec } from './types';

interface EndpointParametersProps {
  parameters: ParameterSpec[];
  inputs: Record<string, string>;
  onInputChange: (paramName: string, value: string) => void;
}

export const EndpointParameters: React.FC<EndpointParametersProps> = ({ parameters, inputs, onInputChange }) => {
  const t = useTranslations('EditorPage.EndpointRow');

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
        {t('parameters')}
      </h4>
      <div className="flex flex-col gap-1.5">
        {parameters.map((param) => (
          <div
            key={param.name}
            className="flex items-center gap-4 text-xs font-mono py-2 border-b border-neutral-100 dark:border-neutral-800/40 last:border-0"
          >
            <div className="w-1/4 min-w-[120px]">
              <span className="font-bold text-neutral-700 dark:text-neutral-300">{param.name}</span>
              {param.required ? <span className="text-rose-500 ml-0.5">*</span> : null}
              <span className="text-neutral-400 dark:text-neutral-500 block text-[10px] lowercase font-sans">
                {t('paramIn', { location: param.in })}
              </span>
            </div>
            <input
              className="flex-1 p-1.5 px-3 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-zinc-900 text-neutral-800 dark:text-neutral-200 rounded-xs outline-none focus:ring-1 focus:ring-neutral-400 text-xs"
              placeholder={t('placeholderParam', { type: param.schema?.type || 'string' })}
              type="text"
              value={inputs[param.name] || ''}
              onChange={(e) => onInputChange(param.name, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
