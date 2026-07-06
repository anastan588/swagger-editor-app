'use client';

import React, { createContext, useContext, useState } from 'react';

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

export const SchemaProvider = ({ children, initialSchema }: { children: React.ReactNode; initialSchema: string }) => {
  const auth = useContext(AuthContext);
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

  const currentSchema = isAuthenticated ? schema : '';
  const currentIsValid = isAuthenticated ? isValid : false;
  const currentErrors = isAuthenticated ? errors : [];
  const currentEndpoints = isAuthenticated ? endpoints : [];

  const setSchema = (value: string) => {
    if (!isAuthenticated) return;

    setSchemaState(value);
    setIsSaved(false);

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

  const saveSchema = async () => {
    if (!isAuthenticated) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const trimmedSchema = schema.trim();

    if (trimmedSchema) {
      const { error } = await supabase
        .from('schemas')
        .upsert(
          { user_id: user.id, content: trimmedSchema, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' },
        );

      if (!error) setIsSaved(true);
    } else {
      const { error } = await supabase.from('schemas').delete().eq('user_id', user.id);

      if (!error) {
        setSchemaState('');
        setIsSaved(true);
      }
    }
  };

  const toggleFormat = () => {
    if (!isAuthenticated || !currentIsValid || !currentSchema.trim()) return;

    try {
      if (format === 'json') {
        const yamlResult = jsonToYaml(currentSchema);
        setSchemaState(yamlResult);
        setFormat('yaml');
      } else {
        const jsonResult = yamlToJson(currentSchema);
        setSchemaState(jsonResult);
        setFormat('json');
      }
      setIsSaved(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Conversion error occurred.';
      setErrors([msg]);
    }
  };

  return (
    <SchemaContext.Provider
      value={{
        schema: currentSchema,
        setSchema,
        format,
        toggleFormat,
        isValid: currentIsValid,
        isSaved,
        errors: currentErrors,
        endpoints: currentEndpoints,
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
