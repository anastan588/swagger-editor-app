import * as yaml from 'js-yaml';
import { describe, expect, it, vi } from 'vitest';

import { jsonToYaml, parseYamlToObject, yamlToJson } from '../utils/yamlCompiler';

vi.mock('js-yaml', async (importOriginal) => {
  const actual = await importOriginal<typeof import('js-yaml')>();
  return {
    ...actual,
    dump: vi.fn().mockImplementation(actual.dump),
    load: vi.fn().mockImplementation(actual.load),
  };
});

describe('yamlCompiler Utilities', () => {
  describe('jsonToYaml', () => {
    it('successfully converts valid JSON string into indented YAML structure', () => {
      const jsonInput = '{"openapi": "3.0.0", "info": {"title": "Test"}}';
      const result = jsonToYaml(jsonInput);

      expect(result).toContain('openapi: 3.0.0');
      expect(result).toContain('info:\n  title: Test');
    });

    it('throws custom internationalized error when JSON parsing pipeline fails', () => {
      const invalidJson = '{ openapi: broken }';
      const customError = 'Custom JSON transformation error msg';

      expect(() => jsonToYaml(invalidJson, customError)).toThrowError(customError);
    });

    it('throws default system fallback error when no custom error message parameter is supplied', () => {
      const invalidJson = '{ openapi: broken }';

      expect(() => jsonToYaml(invalidJson)).toThrowError('Failed to stringify JSON structure to YAML format.');
    });
  });

  describe('yamlToJson', () => {
    it('successfully parses clean YAML structure back into formatted JSON string', () => {
      const yamlInput = 'openapi: 3.0.0\ninfo:\n  title: Test';
      const result = yamlToJson(yamlInput);
      const parsed = JSON.parse(result);

      expect(parsed).toHaveProperty('openapi', '3.0.0');
      expect(parsed.info).toHaveProperty('title', 'Test');
    });

    it('throws custom error overriding message parameter when YAML schema is corrupted', () => {
      vi.mocked(yaml.load).mockImplementationOnce(() => {
        throw new Error('Native JS-YAML Failure');
      });

      const customError = 'Custom YAML syntax mismatch alert';
      expect(() => yamlToJson('broken: :', customError)).toThrowError(customError);
    });

    it('falls back to native instance error string messages when custom parameters are absent', () => {
      vi.mocked(yaml.load).mockImplementationOnce(() => {
        throw new Error('Native JS-YAML Failure');
      });

      expect(() => yamlToJson('broken: :')).toThrowError('Native JS-YAML Failure');
    });

    it('handles unexpected non-error throws gracefully inside catch parameters blocks', () => {
      vi.mocked(yaml.load).mockImplementationOnce(() => {
        throw 'Raw String Exception Throw';
      });

      expect(() => yamlToJson('broken: :')).toThrowError('Invalid YAML syntax structure.');
    });
  });

  describe('parseYamlToObject', () => {
    it('transforms valid raw YAML structures directly into javascript records objects', () => {
      const yamlInput = 'openapi: 3.0.4\nswagger: true';
      const result = parseYamlToObject(yamlInput);

      expect(result).toHaveProperty('openapi', '3.0.4');
      expect(result).toHaveProperty('swagger', true);
    });

    it('returns a vacant object empty literal if the loaded content resolves to an array layer list', () => {
      const yamlInput = '- item1\n- item2';
      const result = parseYamlToObject(yamlInput);

      expect(result).toEqual({});
    });

    it('returns an empty literal object container when parser processing methods throw fatal crashes', () => {
      vi.mocked(yaml.load).mockImplementationOnce(() => {
        throw new Error('Fatal Stream Corruption');
      });

      const result = parseYamlToObject('corrupted: : :');
      expect(result).toEqual({});
    });
  });
});
