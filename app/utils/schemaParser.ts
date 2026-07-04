import { JsonValue, parseYamlToObject } from '@/app/utils/yamlCompiler';

interface ParsedResult {
  format: 'json' | 'yaml';
  isValid: boolean;
  errors: string[];
  endpoints: Array<{ path: string; method: string }>;
  fullObject: Record<string, JsonValue> | null;
}

export const parseInitialSchema = (rawSchema: string): ParsedResult => {
  const result: ParsedResult = {
    format: 'yaml',
    isValid: false,
    errors: [],
    endpoints: [],
    fullObject: null,
  };

  if (!rawSchema || !rawSchema.trim()) return result;

  const trimmed = rawSchema.trim();
  const isJsonFormat =
    (trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'));

  result.format = isJsonFormat ? 'json' : 'yaml';

  try {
    let parsedObj: Record<string, JsonValue> = {};

    if (result.format === 'json') {
      parsedObj = JSON.parse(trimmed) as Record<string, JsonValue>;
    } else {
      parsedObj = parseYamlToObject(trimmed);
    }

    const openapiVer = parsedObj.openapi || parsedObj.swagger;
    if (!openapiVer) {
      throw new Error('Missing "openapi" or "swagger" version declaration descriptor field.');
    }

    if (!parsedObj.info || typeof parsedObj.info !== 'object' || Array.isArray(parsedObj.info)) {
      throw new Error('Missing or invalid root "info" object metadata.');
    }

    if (parsedObj.paths && typeof parsedObj.paths === 'object' && !Array.isArray(parsedObj.paths)) {
      const pathsObj = parsedObj.paths as Record<string, Record<string, unknown>>;

      result.endpoints = Object.entries(pathsObj).flatMap(([path, methods]) => {
        if (!path.startsWith('/')) return [];

        if (methods && typeof methods === 'object' && !Array.isArray(methods)) {
          return Object.keys(methods).map((method) => ({
            path,
            method: method.toLowerCase(),
          }));
        }
        return [];
      });
    }

    result.isValid = true;
    result.fullObject = parsedObj;
  } catch (err: unknown) {
    result.isValid = false;
    result.errors = [err instanceof Error ? err.message : 'Invalid OpenAPI specification structure.'];
    result.fullObject = null;
  }

  return result;
};
