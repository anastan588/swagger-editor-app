'use client';

import React, { useCallback, useContext, useEffect, useState } from 'react';

import { ErrorToastContext } from '@/app/components/ErrorToastContext';
import { AuthContext } from '@/app/context/AuthContext';
import { SchemaContext } from '@/app/context/SchemaContextValue';
import { parseInitialSchema } from '@/app/utils/schemaParser';
import { jsonToYaml, yamlToJson } from '@/app/utils/yamlCompiler';
import { createClient } from '@/lib/supabase/client';

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

  const [schema, setSchemaState] = useState<string>(initialSchema);

  const parsedInitial = React.useMemo(() => {
    return parseInitialSchema(initialSchema);
  }, [initialSchema]);

  const [format, setFormat] = useState<'json' | 'yaml'>(parsedInitial.format);
  const [isValid, setIsValid] = useState<boolean>(parsedInitial.isValid);
  const [errors, setErrors] = useState<string[]>(parsedInitial.errors);
  const [endpoints, setEndpoints] = useState<Array<{ path: string; method: string }>>(parsedInitial.endpoints);
  const [isSaved, setIsSaved] = useState<boolean>(true);

  const applySchemaState = useCallback((value: string, saved: boolean) => {
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
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      writeSchemaDraft('');
      return;
    }

    if (initialSchema.trim()) {
      writeSchemaDraft(initialSchema);
      return;
    }

    const schemaDraft = readSchemaDraft();
    if (schemaDraft.trim()) {
      let isActive = true;

      queueMicrotask(() => {
        if (isActive) {
          applySchemaState(schemaDraft, false);
        }
      });

      return () => {
        isActive = false;
      };
    }
  }, [applySchemaState, initialSchema, isAuthenticated]);

  const setSchema = (value: string) => {
    if (isAuthenticated) {
      writeSchemaDraft(value);
    }
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
        if (isAuthenticated) {
          writeSchemaDraft(yamlResult);
        }
        setSchemaState(yamlResult);
        setFormat('yaml');
      } else {
        const jsonResult = yamlToJson(schema);
        if (isAuthenticated) {
          writeSchemaDraft(jsonResult);
        }
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
