'use client';

import { useContext, useEffect } from 'react';
import { AlertCircle, Check, CheckCircle, FileJson, Layers, Save, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useSchema } from '@/app/context/SchemaContextValue';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import { ErrorToastContext } from './ErrorToastContext';
import { useAuth } from './useAuth';

interface ExtendedWindow extends Window {
  showOpenFilePicker?: (options?: {
    types?: Array<{ description: string; accept: Record<string, string[]> }>;
    excludeAcceptAllOption?: boolean;
    multiple?: boolean;
  }) => Promise<Array<{ getFile: () => Promise<File> }>>;
}

export const CodeEditor = () => {
  const t = useTranslations('EditorPage.CodeEditor');
  const { schema, setSchema, format, toggleFormat, isValid, isSaved, errors, saveSchema } = useSchema();
  const { isAuthenticated } = useAuth();
  const errorToast = useContext(ErrorToastContext);
  const isSaveDisabled = !isAuthenticated || isSaved;

  const safeErrors = Array.isArray(errors) ? errors : [String(errors)];

  const handleFileLoadClick = async () => {
    try {
      const currentWindow = window as unknown as ExtendedWindow;
      if (currentWindow.showOpenFilePicker) {
        const [fileHandle] = await currentWindow.showOpenFilePicker({
          types: [
            {
              description: t('filePickerDescription'),
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
          input.remove();
        };
        input.click();
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        errorToast?.showError(t('loadFileError'));
      }
    }
  };

  const handleSaveSchema = async () => {
    try {
      await saveSchema();
    } catch {
      errorToast?.showError(t('saveSchemaError'));
    }
  };

  useEffect(() => {
    const originalWarn = console.warn;
    const originalError = console.error;

    const filterWarning = (msg: unknown, ...args: unknown[]) => {
      const msgStr = String(msg);
      if (msgStr.includes('UNSAFE_componentWillReceiveProps') || msgStr.includes('ModelCollapse')) {
        return;
      }
      originalWarn(msg, ...args);
    };

    const filterError = (msg: unknown, ...args: unknown[]) => {
      const msgStr = String(msg);
      if (msgStr.includes('UNSAFE_componentWillReceiveProps') || msgStr.includes('ModelCollapse')) {
        return;
      }
      originalError(msg, ...args);
    };

    console.warn = filterWarning;
    console.error = filterError;

    return () => {
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground border rounded-lg overflow-hidden shadow-sm transition-colors duration-200 min-h-0">
      <div className="flex flex-wrap gap-2 shrink-0 items-center justify-between px-4 py-3 bg-muted/40 border-b">
        <div className="flex items-center gap-2">
          {format === 'json' ? (
            <FileJson className="text-foreground" size={16} />
          ) : (
            <Layers className="text-foreground" size={16} />
          )}
          <span className="font-bold text-xs tracking-wider uppercase">
            {t('title', { format: format.toUpperCase() })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button className="text-xs h-8 gap-1.5" size="sm" variant="outline" onClick={handleFileLoadClick}>
            <Upload size={14} />
            {t('loadFileBtn')}
          </Button>

          <Button
            className="text-xs h-8 gap-1.5"
            disabled={isSaveDisabled}
            size="sm"
            variant={isSaveDisabled ? 'secondary' : 'outline'}
            onClick={handleSaveSchema}
          >
            {!isAuthenticated ? (
              <>
                <Save size={14} />
                {t('signInToSaveBtn')}
              </>
            ) : isSaved ? (
              <>
                <Check size={14} />
                {t('savedBtn')}
              </>
            ) : (
              <>
                <Save size={14} />
                {t('saveSchemaBtn')}
              </>
            )}
          </Button>

          <Button
            className="text-xs h-8"
            disabled={!isValid}
            size="sm"
            variant={isValid ? 'default' : 'secondary'}
            onClick={toggleFormat}
          >
            {t('switchToBtn', { targetFormat: format === 'json' ? 'YAML' : 'JSON' })}
          </Button>
        </div>
      </div>

      <div className="flex-1 relative w-full min-h-0">
        <Textarea
          className="absolute inset-0 w-full h-full p-4 bg-background font-mono text-sm resize-none focus-visible:ring-0 focus-visible:ring-offset-0 border-0 rounded-none text-foreground placeholder:text-muted-foreground transition-colors duration-200 overflow-y-auto"
          placeholder={t('textareaPlaceholder')}
          value={schema}
          onChange={(e) => setSchema(e.target.value)}
        />
      </div>

      <div className="p-4 border-t shrink-0">
        {isValid ? (
          <Alert
            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 [&>svg]:text-emerald-600 dark:[&>svg]:text-emerald-400"
            variant="default"
          >
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="font-medium tracking-wide">{t('validSchemaMsg')}</AlertDescription>
          </Alert>
        ) : (
          <Alert
            className="bg-destructive/10 text-destructive border-destructive/20 [&>svg]:text-destructive"
            variant="destructive"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-extrabold uppercase tracking-wider text-[10px] mb-1.5">
              {t('invalidSchemaTitle')}
            </AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1 font-mono text-xs">
                {safeErrors.length > 0 && safeErrors[0] !== '' ? (
                  safeErrors.map((err: string, idx: number) => <li key={idx}>{err}</li>)
                ) : (
                  <li>{t('emptySchemaMsg')}</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};
