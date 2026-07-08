'use client';

import React, { useMemo } from 'react';

interface JSONBeautifierProps {
  rawJson: string;
}

export const JSONBeautifier: React.FC<JSONBeautifierProps> = ({ rawJson }) => {
  const renderedTokens = useMemo<React.ReactNode[]>(() => {
    if (!rawJson.trim()) return [];

    try {
      const parsed = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
      const formatted = JSON.stringify(parsed, null, 2);
      const lines = formatted.split('\n');

      return lines.map((line, index) => {
        const tokenRegex =
          /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g;

        let lastIndex = 0;
        const matches: React.ReactNode[] = [];
        let match: RegExpExecArray | null;

        while ((match = tokenRegex.exec(line)) !== null) {
          const matchIndex = match.index;
          const token = match[0];

          if (matchIndex > lastIndex) {
            matches.push(line.substring(lastIndex, matchIndex));
          }

          let className = 'text-neutral-800 dark:text-neutral-200';

          if (/^"/.test(token)) {
            if (/:$/.test(token)) {
              className = 'text-purple-600 dark:text-purple-400 font-semibold';
            } else {
              className = 'text-emerald-600 dark:text-emerald-400 select-all';
            }
          } else if (/true|false/.test(token)) {
            className = 'text-amber-600 dark:text-amber-500 font-bold';
          } else if (/null/.test(token)) {
            className = 'text-neutral-400 dark:text-neutral-500 italic';
          } else {
            className = 'text-blue-600 dark:text-blue-400';
          }

          matches.push(
            <span key={matchIndex} className={className}>
              {token}
            </span>,
          );

          lastIndex = tokenRegex.lastIndex;
        }

        if (lastIndex < line.length) {
          matches.push(line.substring(lastIndex));
        }

        return (
          <div key={index} className="min-h-5 whitespace-pre select-all">
            {matches.length > 0 ? matches : line}
          </div>
        );
      });
    } catch {
      return [
        <div key="fallback" className="whitespace-pre-wrap break-all text-neutral-700 dark:text-neutral-300 select-all">
          {rawJson}
        </div>,
      ];
    }
  }, [rawJson]);

  return <code className="block font-mono text-xs leading-relaxed pr-24 select-all">{renderedTokens}</code>;
};
