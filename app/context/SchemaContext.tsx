'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

import { useAuth } from '@/app/components/useAuth';
import { parseInitialSchema } from '@/app/utils/schemaParser';
import { jsonToYaml, yamlToJson } from '@/app/utils/yamlCompiler';

interface SchemaContextValue {
  schema: string;
  setSchema: (value: string) => void;
  format: 'json' | 'yaml';
  toggleFormat: () => void;
  isValid: boolean;
  isSaved: boolean;
  isReady: boolean;
  errors: string[];
  endpoints: Array<{ path: string; method: string }>;
  saveSchema: () => void;
}

const SchemaContext = createContext<SchemaContextValue | null>(null);

export const SchemaProvider = ({ children }: { children: React.ReactNode }) => {
  useAuth();
  const [schema, setSchemaState] = useState<string>('');
  const [format, setFormat] = useState<'json' | 'yaml'>('yaml');
  const [isValid, setIsValid] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [endpoints, setEndpoints] = useState<Array<{ path: string; method: string }>>([]);
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const savedData = localStorage.getItem('saved_swagger_schema') || '';

      if (savedData) {
        setSchemaState(savedData);
        const parsedData = parseInitialSchema(savedData);
        setFormat(parsedData.format);
        setIsValid(parsedData.isValid);
        setErrors(parsedData.errors);
        setEndpoints(parsedData.endpoints);
      }

      setIsReady(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const setSchema = (value: string) => {
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

  const saveSchema = () => {
    if (schema.trim()) {
      localStorage.setItem('saved_swagger_schema', schema);
      setIsSaved(true);
    } else {
      localStorage.removeItem('saved_swagger_schema');
      setIsSaved(true);
    }
  };

  const toggleFormat = () => {
    if (!isValid || !schema.trim()) return;

    try {
      if (format === 'json') {
        const yamlResult = jsonToYaml(schema);
        setSchemaState(yamlResult);
        setFormat('yaml');
      } else {
        const jsonResult = yamlToJson(schema);
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
      value={{ schema, setSchema, format, toggleFormat, isValid, isSaved, isReady, errors, endpoints, saveSchema }}
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
