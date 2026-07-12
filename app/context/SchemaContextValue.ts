import { createContext, useContext } from 'react';

export interface SchemaContextValue {
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

export const SchemaContext = createContext<SchemaContextValue | null>(null);

export const useSchema = (): SchemaContextValue => {
  const context = useContext(SchemaContext);
  if (!context) throw new Error('useSchema must be used within SchemaProvider');
  return context;
};
