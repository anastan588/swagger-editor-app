'use client';

import { useEffect } from 'react';
import { AlertCircle, Check, CheckCircle, FileJson, Layers, Save, Upload } from 'lucide-react';

import { EditorSkeleton } from '@/app/components/EditorSkeleton';
import { useSchema } from '@/app/context/SchemaContext';

interface ExtendedWindow extends Window {
  showOpenFilePicker?: (options?: {
    types?: Array<{ description: string; accept: Record<string, string[]> }>;
    excludeAcceptAllOption?: boolean;
    multiple?: boolean;
  }) => Promise<Array<{ getFile: () => Promise<File> }>>;
}

export const CodeEditor = () => {
  const { schema, setSchema, format, toggleFormat, isValid, isSaved, isReady, errors, saveSchema } = useSchema();

  const safeErrors = Array.isArray(errors) ? errors : [String(errors)];

  const handleFileLoadClick = async () => {
    try {
      const currentWindow = window as unknown as ExtendedWindow;
      if (currentWindow.showOpenFilePicker) {
        const [fileHandle] = await currentWindow.showOpenFilePicker({
          types: [
            {
              description: 'OpenAPI Specification Files',
              accept: {
                'application/json': ['.json'],
                'text/yaml': ['.yaml', '.yml'],
              },
            },
          ],
          excludeAcceptAllOption: true,
          multiple: false,
        });

        if (!fileHandle) return;

        const file = await fileHandle.getFile();
        const text = await file.text();
        setSchema(text);
      } else {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.yaml,.yml';
        input.onchange = async (e) => {
          const target = e.target as HTMLInputElement;
          const file = target.files?.[0];
          if (!file) return;
          const text = await file.text();
          setSchema(text);
        };
        input.click();
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('File access error:', err);
      }
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const originalWarn = console.warn;
    const originalError = console.error;

    const filterWarning = (msg: unknown, ...args: unknown[]) => {
      const msgStr = String(msg);
      if (msgStr.includes('UNSAFE_componentWillReceiveProps') || msgStr.includes('ModelCollapse')) {
        return;
      }
      originalWarn(msg, ...args);
    };

    console.warn = filterWarning;
    console.error = filterWarning;

    return () => {
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  if (!isReady) {
    return <EditorSkeleton />;
  }

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-zinc-950 text-black dark:text-white border border-neutral-200 dark:border-neutral-800 rounded-sm overflow-hidden shadow-sm transition-colors duration-200 min-h-0">
      <div className="flex shrink-0 items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-zinc-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          {format === 'json' ? (
            <FileJson className="text-black dark:text-white" size={16} />
          ) : (
            <Layers className="text-black dark:text-white" size={16} />
          )}
          <span className="font-bold text-xs tracking-wider uppercase">Editor ({format})</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1.5 text-xs font-medium border border-black bg-white text-black hover:bg-black hover:text-white dark:border-white dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
            type="button"
            onClick={handleFileLoadClick}
          >
            <Upload size={14} />
            Load File
          </button>

          <button
            className={`px-3 py-1.5 text-xs font-medium border flex items-center gap-1.5 transition-all duration-200 ${
              isSaved
                ? 'border-neutral-200 text-neutral-400 bg-neutral-50 dark:border-neutral-800 dark:text-neutral-500 dark:bg-zinc-900 cursor-default'
                : 'border-black bg-white text-black hover:bg-black hover:text-white dark:border-white dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black cursor-pointer'
            }`}
            disabled={isSaved}
            type="button"
            onClick={saveSchema}
          >
            {isSaved ? (
              <>
                <Check size={14} />
                Saved
              </>
            ) : (
              <>
                <Save size={14} />
                Save Schema
              </>
            )}
          </button>

          <button
            className={`px-3 py-1.5 text-xs font-medium border transition-all duration-200 ${
              isValid
                ? 'border-black bg-black text-white hover:bg-white hover:text-black dark:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white cursor-pointer'
                : 'border-neutral-200 text-neutral-400 bg-neutral-50 dark:border-neutral-800 dark:text-neutral-600 dark:bg-zinc-900 cursor-not-allowed'
            }`}
            disabled={!isValid}
            type="button"
            onClick={toggleFormat}
          >
            Switch to {format === 'json' ? 'YAML' : 'JSON'}
          </button>
        </div>
      </div>

      <div className="flex-1 relative w-full min-h-0">
        <textarea
          className="absolute inset-0 w-full h-full p-4 bg-white dark:bg-black font-mono text-sm resize-none focus:outline-none text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-600 transition-colors duration-200 overflow-y-auto"
          placeholder="Paste, type, or load your OpenAPI/Swagger specification (JSON/YAML) here..."
          value={schema}
          onChange={(e) => setSchema(e.target.value)}
        />
      </div>

      <div
        className={`p-4 border-t flex shrink-0 items-start gap-3 text-xs transition-colors duration-300 ${
          isValid
            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-300'
            : 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-300'
        }`}
      >
        {isValid ? (
          <>
            <CheckCircle className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" size={16} />
            <div className="font-medium tracking-wide">
              Valid OpenAPI Specification. Endpoints synced down into viewer.
            </div>
          </>
        ) : (
          <>
            <AlertCircle className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-400" size={16} />
            <div className="flex-1">
              <span className="font-extrabold block mb-1.5 uppercase tracking-wider text-[10px] text-rose-700 dark:text-rose-400">
                Invalid Schema Specification Error:
              </span>
              <ul className="list-disc list-inside space-y-1 font-mono text-rose-800 dark:text-rose-300/90">
                {safeErrors.length > 0 && safeErrors[0] !== '' ? (
                  safeErrors.map((err: string, idx: number) => <li key={idx}>{err}</li>)
                ) : (
                  <li>No schema provided or layout empty</li>
                )}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
