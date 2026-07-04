import * as yaml from 'js-yaml';

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export const jsonToYaml = (jsonStr: string): string => {
  try {
    const parsedObj = JSON.parse(jsonStr) as Record<string, unknown>;
    return yaml.dump(parsedObj, { indent: 2, skipInvalid: true });
  } catch {
    throw new Error('Failed to stringify JSON structure to YAML format.');
  }
};

export const yamlToJson = (yamlStr: string): string => {
  try {
    const nativeObj = yaml.load(yamlStr) as Record<string, unknown>;
    return JSON.stringify(nativeObj, null, 2);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid YAML syntax structure.';
    throw new Error(msg);
  }
};

export const parseYamlToObject = (yamlStr: string): Record<string, JsonValue> => {
  try {
    const doc = yaml.load(yamlStr);
    if (doc && typeof doc === 'object' && !Array.isArray(doc)) {
      return doc as Record<string, JsonValue>;
    }
    return {};
  } catch {
    return {};
  }
};
