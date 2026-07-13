import { beforeEach, describe, expect, it, vi } from 'vitest';

import { parseInitialSchema } from '@/app/utils/schemaParser';

const mocks = vi.hoisted(() => ({
  parseYamlToObject: vi.fn(),
}));

vi.mock('@/app/utils/yamlCompiler', () => ({
  parseYamlToObject: mocks.parseYamlToObject,
}));

describe('parseInitialSchema', () => {
  beforeEach(() => {
    mocks.parseYamlToObject.mockClear();
  });

  it('returns default initial object structure when raw input is empty', () => {
    const result = parseInitialSchema('   ');
    expect(result).toEqual({
      format: 'yaml',
      isValid: false,
      errors: [],
      endpoints: [],
      fullObject: null,
    });
  });

  it('correctly detects JSON format and parses valid OpenAPI specifications', () => {
    const validJson = JSON.stringify({
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0' },
      paths: {
        '/users': {
          get: {},
          post: {},
        },
      },
    });

    const result = parseInitialSchema(validJson);

    expect(result.format).toBe('json');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.endpoints).toEqual([
      { path: '/users', method: 'get' },
      { path: '/users', method: 'post' },
    ]);
    expect(result.fullObject).not.toBeNull();
  });

  it('correctly detects YAML format and calls parseYamlToObject compiler method', () => {
    const mockYamlObject = {
      swagger: '2.0',
      info: { title: 'Yaml API', version: '2.0' },
      paths: {
        '/items': {
          put: {},
        },
      },
    };
    mocks.parseYamlToObject.mockReturnValue(mockYamlObject);

    const result = parseInitialSchema('swagger: "2.0"\ninfo:\n  title: Yaml API');

    expect(result.format).toBe('yaml');
    expect(mocks.parseYamlToObject).toHaveBeenCalledWith('swagger: "2.0"\ninfo:\n  title: Yaml API');
    expect(result.isValid).toBe(true);
    expect(result.endpoints).toEqual([{ path: '/items', method: 'put' }]);
  });

  it('catches invalid formatting and populates native JSON parse syntax errors', () => {
    const result = parseInitialSchema('{"openapi": "3.0.0",}');

    expect(result.format).toBe('json');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(typeof result.errors[0]).toBe('string');
    expect(result.fullObject).toBeNull();
  });

  it('throws validation error when version declaration key descriptors are missing', () => {
    const missingVersionJson = JSON.stringify({
      info: { title: 'No Version', version: '1.0' },
    });

    const result = parseInitialSchema(missingVersionJson);

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(['Missing "openapi" or "swagger" version declaration descriptor field.']);
  });

  it('throws validation error when root info metadata object shape is invalid', () => {
    const invalidInfoJson = JSON.stringify({
      openapi: '3.0.0',
      info: 'not-an-object',
    });

    const result = parseInitialSchema(invalidInfoJson);

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(['Missing or invalid root "info" object metadata.']);
  });

  it('filters abnormal structural definitions out from endpoints path tokenizer mapping loops', () => {
    const abnormalJson = JSON.stringify({
      openapi: '3.0.0',
      info: { title: 'Abnormal API', version: '1.0' },
      paths: {
        'invalid-path-without-slash': { get: {} },
        '/valid-path': 'not-an-object-methods-descriptor',
      },
    });

    const result = parseInitialSchema(abnormalJson);

    expect(result.isValid).toBe(true);
    expect(result.endpoints).toHaveLength(0);
  });
});
