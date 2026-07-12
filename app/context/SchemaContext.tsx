'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

import { ErrorToastContext } from '@/app/components/ErrorToastContext';
import { AuthContext } from '@/app/context/AuthProvider';
import { parseInitialSchema } from '@/app/utils/schemaParser';
import { jsonToYaml, yamlToJson } from '@/app/utils/yamlCompiler';
import { createClient } from '@/lib/supabase/client';

interface SchemaContextValue {
  schema: string;
  setSchema: (value: string) => void;
  format: 'json' | 'yaml';
  toggleFormat: () => void;
  isValid: boolean;
  isSaved: boolean;
  errors: string[];
  endpoints: Array<{ path: string; method: string }>;
  saveSchema: () => Promise<void>;
}

const SchemaContext = createContext<SchemaContextValue | null>(null);
const SCHEMA_DRAFT_STORAGE_KEY = 'swagger-editor-schema-draft';

const readSchemaDraft = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    return window.localStorage.getItem(SCHEMA_DRAFT_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
};

const writeSchemaDraft = (value: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (value.trim()) {
      window.localStorage.setItem(SCHEMA_DRAFT_STORAGE_KEY, value);
    } else {
      window.localStorage.removeItem(SCHEMA_DRAFT_STORAGE_KEY);
    }
  } catch {
    return;
  }
};

export const SchemaProvider = ({ children, initialSchema }: { children: React.ReactNode; initialSchema: string }) => {
  const auth = useContext(AuthContext);
  const errorToast = useContext(ErrorToastContext);
  const isAuthenticated = auth?.isAuthenticated ?? false;

  const [initialEditorSchema] = useState(() => (initialSchema.trim() ? initialSchema : readSchemaDraft()));
  const [schema, setSchemaState] = useState<string>(initialEditorSchema);

  const parsedInitial = React.useMemo(() => {
    return parseInitialSchema(initialEditorSchema);
  }, [initialEditorSchema]);

  const [format, setFormat] = useState<'json' | 'yaml'>(parsedInitial.format);
  const [isValid, setIsValid] = useState<boolean>(parsedInitial.isValid);
  const [errors, setErrors] = useState<string[]>(parsedInitial.errors);
  const [endpoints, setEndpoints] = useState<Array<{ path: string; method: string }>>(parsedInitial.endpoints);
  const [isSaved, setIsSaved] = useState<boolean>(true);

  const applySchemaState = (value: string, saved: boolean) => {
    setSchemaState(value);
    setIsSaved(saved);

    if (!value || !value.trim()) {
      setIsValid(false);
      setErrors([]);
      setEndpoints([]);
      return;
    }

    const parsedData = parseInitialSchema(value);
    setFormat(parsedData.format);
    setIsValid(parsedData.isValid);
    setErrors(parsedData.errors);
    setEndpoints(parsedData.endpoints);
  };

  useEffect(() => {
    if (initialSchema.trim()) {
      writeSchemaDraft(initialSchema);
    }
  }, [initialSchema]);

  const setSchema = (value: string) => {
    writeSchemaDraft(value);
    applySchemaState(value, false);
  };

  const saveSchema = async () => {
    if (!isAuthenticated) return;

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        errorToast?.showError('Unable to save the schema because the session is no longer active.');
        return;
      }

      const trimmedSchema = schema.trim();

      if (trimmedSchema) {
        const { error } = await supabase
          .from('schemas')
          .upsert(
            { user_id: user.id, content: trimmedSchema, updated_at: new Date().toISOString() },
            { onConflict: 'user_id' },
          );

        if (error) {
          errorToast?.showError('Unable to save the schema. Please try again.');
          return;
        }

        writeSchemaDraft(trimmedSchema);
        setIsSaved(true);
      } else {
        const { error } = await supabase.from('schemas').delete().eq('user_id', user.id);

        if (error) {
          errorToast?.showError('Unable to clear the saved schema. Please try again.');
          return;
        }

        writeSchemaDraft('');
        setSchemaState('');
        setIsSaved(true);
      }
    } catch {
      errorToast?.showError('Unable to save the schema. Please try again.');
    }
  };

  const toggleFormat = () => {
    if (!isValid || !schema.trim()) return;

    try {
      if (format === 'json') {
        const yamlResult = jsonToYaml(schema);
        writeSchemaDraft(yamlResult);
        setSchemaState(yamlResult);
        setFormat('yaml');
      } else {
        const jsonResult = yamlToJson(schema);
        writeSchemaDraft(jsonResult);
        setSchemaState(jsonResult);
        setFormat('json');
      }
      setIsSaved(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Conversion error occurred.';
      setErrors([msg]);
      errorToast?.showError(msg);
    }
  };

  return (
    <SchemaContext.Provider
      value={{
        schema,
        setSchema,
        format,
        toggleFormat,
        isValid,
        isSaved,
        errors,
        endpoints,
        saveSchema,
      }}
    >
      {children}
    </SchemaContext.Provider>
  );
};

export const useSchema = (): SchemaContextValue => {
  const context = useContext(SchemaContext);
  if (!context) throw new Error('useSchema must be used within SchemaProvider');
  return context;
};
