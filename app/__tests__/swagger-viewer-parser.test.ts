import { beforeEach, describe, expect, it, vi } from 'vitest';
import { parse } from 'yaml';

import { FlattenedEndpoint } from '@/app/components/swagger/types';
import {
  compileRequestDetails,
  extractBaseUrl,
  flattenEndpoints,
  generateCurlCommand,
  parseYamlSchema,
  stringifyToYaml,
} from '@/app/utils/SwaggerViewerParser';

vi.mock('yaml', () => ({
  parse: vi.fn(),
}));

describe('SwaggerViewerParser Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('parseYamlSchema', () => {
    it('returns empty object if schemaText is empty or whitespace', () => {
      expect(parseYamlSchema('')).toEqual({});
      expect(parseYamlSchema('   \n  ')).toEqual({});
    });

    it('returns parsed object when yaml parsing succeeds', () => {
      const mockResult = { openapi: '3.0.0', info: { title: 'Test' } };
      vi.mocked(parse).mockReturnValue(mockResult);

      const result = parseYamlSchema('openapi: 3.0.0');
      expect(result).toEqual(mockResult);
      expect(parse).toHaveBeenCalledWith('openapi: 3.0.0');
    });

    it('returns empty object if parsed value is an array or not an object', () => {
      vi.mocked(parse).mockReturnValue(['item1', 'item2']);
      expect(parseYamlSchema('array')).toEqual({});

      vi.mocked(parse).mockReturnValue('just a string');
      expect(parseYamlSchema('string')).toEqual({});
    });

    it('rethrows yaml parsing exceptions without writing console errors', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockError = new Error('Syntax error');
      vi.mocked(parse).mockImplementation(() => {
        throw mockError;
      });

      expect(() => parseYamlSchema('invalid: yaml:')).toThrow(mockError);
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe('extractBaseUrl', () => {
    const fallback = 'https://wizardworldapi.com';

    it('returns fallback url if parsedObject is null or undefined', () => {
      expect(extractBaseUrl(null, fallback)).toBe(fallback);
    });

    it('extracts base url from servers array in OpenAPI v3 structure', () => {
      const parsed = {
        servers: [{ url: 'https://example.com' }, { url: 'https://prod.com' }],
      };
      expect(extractBaseUrl(parsed, fallback)).toBe('https://example.com');
    });

    it('extracts base url from host schemes and basePath in Swagger v2 structure', () => {
      const parsed = {
        host: 'petstore.swagger.io/',
        schemes: ['https', 'http'],
        basePath: '/v2',
      };
      expect(extractBaseUrl(parsed, fallback)).toBe('https://petstore.swagger.io/v2');
    });

    it('uses defaults when schemes or basePath are missing in Swagger v2', () => {
      const parsed = { host: 'petstore.swagger.io' };
      expect(extractBaseUrl(parsed, fallback)).toBe('https://petstore.swagger.io');
    });

    it('returns fallback url if no servers or host metadata exist', () => {
      const parsed = { info: { title: 'Empty Metadata API' } };
      expect(extractBaseUrl(parsed, fallback)).toBe(fallback);
    });
  });

  describe('flattenEndpoints', () => {
    it('returns empty array if paths map is invalid or missing', () => {
      expect(flattenEndpoints(null)).toEqual([]);
      expect(flattenEndpoints({ info: {} })).toEqual([]);
      expect(flattenEndpoints({ paths: 'not-an-object' as unknown as Record<string, unknown> })).toEqual([]);
    });

    it('correctly maps and filters valid HTTP method operations', () => {
      const parsed = {
        paths: {
          '/users': {
            get: { summary: 'List users' },
            post: { summary: 'Create user' },
            invalidMethod: { summary: 'Ignore me' },
          },
          '/users/{id}': {
            delete: { summary: 'Delete user' },
          },
        },
      };

      const result = flattenEndpoints(parsed);

      expect(result).toHaveLength(3);
      expect(result).toContainEqual({
        id: 'get-/users',
        path: '/users',
        method: 'GET',
        spec: { summary: 'List users' },
      });
      expect(result).toContainEqual({
        id: 'delete-/users/{id}',
        path: '/users/{id}',
        method: 'DELETE',
        spec: { summary: 'Delete user' },
      });
    });
  });

  describe('compileRequestDetails', () => {
    const mockEndpoint: FlattenedEndpoint = {
      id: 'get-/users/{id}',
      path: '/users/{id}',
      method: 'GET',
      spec: {
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'role', in: 'query', required: false, schema: { type: 'string' } },
          { name: 'X-Custom-Auth', in: 'header', required: false, schema: { type: 'string' } },
          { name: 'session_id', in: 'cookie', required: false, schema: { type: 'string' } },
        ],
        responses: {},
      },
    };

    it('compiles parameters into clean query path variables and headers mapping', () => {
      const inputs = {
        id: '123',
        role: 'admin',
        'X-Custom-Auth': 'secret-token',
      };
      const baseUrl = 'https://api.com';

      const result = compileRequestDetails(mockEndpoint, inputs, baseUrl);

      expect(result.cleanPathWithQuery).toBe('/users/123?role=admin');
      expect(result.fullAbsoluteUrl).toBe('https://api.com/users/123?role=admin');
      expect(result.headers).toEqual({ 'X-Custom-Auth': 'secret-token' });
    });

    it('maps cookie parameters into a Cookie header for proxied execution', () => {
      const result = compileRequestDetails(
        mockEndpoint,
        {
          id: '123',
          session_id: 'abc 123',
        },
        'https://api.com',
      );

      expect(result.headers).toEqual({ Cookie: 'session_id=abc%20123' });
    });

    it('encodes values to safely insert path parameter matrices', () => {
      const inputs = { id: 'usr/slash key' };
      const result = compileRequestDetails(mockEndpoint, inputs, 'https://api.com');
      expect(result.cleanPathWithQuery).toBe('/users/usr%2Fslash%20key');
    });
  });

  describe('generateCurlCommand', () => {
    const mockEndpoint: FlattenedEndpoint = {
      id: 'post-/data',
      path: '/data',
      method: 'POST',
      spec: { responses: {} },
    };

    it('generates standard curl command structure for plain endpoints', () => {
      const url = 'https://api.com';
      const result = generateCurlCommand(mockEndpoint, url, {}, '');
      expect(result).toBe('curl -X POST "https://api.com"');
    });

    it('appends formatted headers mapping block segments with backslashes', () => {
      const url = 'https://api.com';
      const headers = { 'Content-Type': 'application/json', Authorization: 'Bearer token' };
      const result = generateCurlCommand(mockEndpoint, url, headers, '');

      expect(result).toContain('-H "Content-Type: application/json"');
      expect(result).toContain('-H "Authorization: Bearer token"');
    });

    it('attaches payload string data to mutation operations safely escaping single quotes', () => {
      const url = 'https://api.com';
      const body = "{ 'name': 'John' }";
      const result = generateCurlCommand(mockEndpoint, url, {}, body);

      expect(result).toContain("-d '{ '\\''name'\\'': '\\''John'\\'' }'");
    });
  });

  describe('stringifyToYaml', () => {
    it('handles primitive values correctly', () => {
      expect(stringifyToYaml(null)).toBe('null');
      expect(stringifyToYaml(undefined)).toBe('');
      expect(stringifyToYaml(123)).toBe('123');
      expect(stringifyToYaml(true)).toBe('true');
    });

    it('escapes strings when containing special tokens characters', () => {
      expect(stringifyToYaml('plain-text')).toBe('"plain-text"');
      expect(stringifyToYaml('text:with:colons')).toBe('"text:with:colons"');
      expect(stringifyToYaml('text-with-dash')).toBe('"text-with-dash"');
    });

    it('stringifies flat and nested object key value matrices structures', () => {
      const obj = {
        name: 'John',
        age: 30,
        meta: {
          active: true,
        },
      };

      const expected = 'name: John\nage: 30\nmeta:\n  active: true';
      expect(stringifyToYaml(obj)).toBe(expected);
    });

    it('converts array index items into native list formats structures', () => {
      const arr = ['apple', 'banana'];
      const expected = '- apple\n- banana';
      expect(stringifyToYaml(arr)).toBe(expected);
    });

    it('processes arrays containing internal key structures values', () => {
      const complex = {
        tags: [{ id: 1 }, { id: 2 }],
      };
      const expected = 'tags:\n  - id: 1\n  - id: 2';
      expect(stringifyToYaml(complex)).toBe(expected);
    });
  });
});
