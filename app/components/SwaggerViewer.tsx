'use client';

import 'swagger-ui-react/swagger-ui.css';

import React, { useMemo } from 'react';
import SwaggerUI from 'swagger-ui-react';

import { useSchema } from '@/app/context/SchemaContext';

export const SwaggerViewer: React.FC = () => {
  const { schema, isValid, format } = useSchema();

  const parsedObject = useMemo(() => {
    if (!isValid || !schema.trim()) return null;
    try {
      if (format === 'json') {
        return JSON.parse(schema);
      }

      const lines = schema.split('\n');
      const root: Record<string, unknown> = {};
      const stack: Array<{ indent: number; obj: Record<string, unknown> }> = [{ indent: -1, obj: root }];

      lines.forEach((line) => {
        if (!line.trim() || line.trim().startsWith('#')) return;
        const indent = line.search(/\S/);
        const colonIdx = line.indexOf(':');
        if (colonIdx === -1) return;

        const key = line
          .substring(0, colonIdx)
          .trim()
          .replace(/^["']|["']$/g, '');
        const val = line
          .substring(colonIdx + 1)
          .trim()
          .replace(/^["']|["']$/g, '');

        while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
          stack.pop();
        }

        const currentContainer = stack[stack.length - 1].obj;
        if (val === '') {
          const newObj: Record<string, unknown> = {};
          currentContainer[key] = newObj;
          stack.push({ indent, obj: newObj });
        } else {
          currentContainer[key] = val;
        }
      });
      return root;
    } catch {
      return null;
    }
  }, [schema, isValid, format]);

  return (
    <div className="h-full bg-white dark:bg-zinc-950 rounded-sm border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-auto p-4 transition-colors duration-200 custom-swagger-container">
      {isValid && parsedObject ? (
        <div className="prose dark:prose-invert max-w-none">
          <SwaggerUI deepLinking={true} docExpansion="list" spec={parsedObject} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-neutral-400 dark:text-neutral-500 gap-3 text-center p-6">
          <div className="w-10 h-10 rounded-full border-2 border-dashed border-neutral-200 dark:border-neutral-800 animate-spin" />
          <p className="text-xs font-light max-w-xs leading-relaxed">
            Awaiting valid configuration to generate interactive UI documentation...
          </p>
        </div>
      )}
    </div>
  );
};
