import { parse } from 'yaml';

import { FlattenedEndpoint, PathItemSpec } from '../components/swagger/types';

/**
 *
 * @param schemaText
 */
export function parseYamlSchema(schemaText: string): Record<string, unknown> {
  if (!schemaText || !schemaText.trim()) {
    return {};
  }

  try {
    const parsed = parse(schemaText);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }

    return {};
  } catch (error) {
    console.error('YAML parsing failed:', error);
    throw error;
  }
}

export function extractBaseUrl(parsedObject: Record<string, unknown> | null, manualFallbackUrl: string): string {
  if (!parsedObject) return manualFallbackUrl;

  if (Array.isArray(parsedObject.servers) && parsedObject.servers.length > 0) {
    const primaryServer = parsedObject.servers[0] as Record<string, unknown>;
    if (typeof primaryServer?.url === 'string' && primaryServer.url.trim()) {
      return primaryServer.url.replace(/\/$/, '');
    }
  }

  if (typeof parsedObject.host === 'string' && parsedObject.host.trim()) {
    const host = parsedObject.host.replace(/\/$/, '');
    const schemes = Array.isArray(parsedObject.schemes) ? parsedObject.schemes : ['https'];
    const preferredScheme = String(schemes[0] || 'https');
    const basePath = typeof parsedObject.basePath === 'string' ? parsedObject.basePath : '';
    return `${preferredScheme}://${host}${basePath.startsWith('/') ? basePath : `/${basePath}`}`.replace(/\/$/, '');
  }

  return manualFallbackUrl;
}

export function flattenEndpoints(parsedObject: Record<string, unknown> | null): FlattenedEndpoint[] {
  if (!parsedObject || typeof parsedObject.paths !== 'object' || parsedObject.paths === null) return [];

  const pathsMap = parsedObject.paths as Record<string, PathItemSpec>;
  const list: FlattenedEndpoint[] = [];

  Object.entries(pathsMap).forEach(([path, pathMethods]) => {
    if (!pathMethods || typeof pathMethods !== 'object') return;
    Object.entries(pathMethods).forEach(([method, operationSpec]) => {
      if (['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) {
        list.push({
          id: `${method}-${path}`,
          path,
          method: method.toUpperCase(),
          spec: operationSpec,
        });
      }
    });
  });

  return list;
}

export function compileRequestDetails(endpoint: FlattenedEndpoint, inputs: Record<string, string>, baseUrl: string) {
  let finalPath = endpoint.path;
  const queryParams = new URLSearchParams();
  const headers: Record<string, string> = {};

  endpoint.spec.parameters?.forEach((param) => {
    const value = inputs[param.name] || '';
    if (param.in === 'path') {
      finalPath = finalPath.replace(`{${param.name}}`, encodeURIComponent(value));
    } else if (param.in === 'query' && value) {
      queryParams.set(param.name, value);
    } else if (param.in === 'header' && value) {
      headers[param.name] = value;
    }
  });

  const queryString = queryParams.toString();
  const cleanPath = finalPath.startsWith('/') ? finalPath : `/${finalPath}`;
  const fullAbsoluteUrl = `${baseUrl}${cleanPath}${queryString ? `?${queryString}` : ''}`;

  return {
    fullAbsoluteUrl,
    cleanPathWithQuery: `${cleanPath}${queryString ? `?${queryString}` : ''}`,
    headers,
  };
}

export function generateCurlCommand(
  endpoint: FlattenedEndpoint,
  fullAbsoluteUrl: string,
  headers: Record<string, string>,
  bodyPayload: string,
): string {
  let curlCmd = `curl -X ${endpoint.method} "${fullAbsoluteUrl}"`;

  Object.entries(headers).forEach(([key, val]) => {
    curlCmd += ` \\\n  -H "${key}: ${val}"`;
  });

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(endpoint.method) && bodyPayload) {
    curlCmd += ` \\\n  -d '${bodyPayload.replace(/'/g, "'\\''")}'`;
  }

  return curlCmd;
}

export function stringifyToYaml(value: unknown, indent = 0): string {
  const padding = ' '.repeat(indent);

  if (value === null) return 'null';
  if (value === undefined) return '';

  if (Array.isArray(value)) {
    if (value.length === 0) return ' []';
    return value
      .map((item) => {
        if (typeof item === 'object' && item !== null) {
          const yamlItem = stringifyToYaml(item, indent + 2).trimStart();
          return `${padding}- ${yamlItem}`;
        }
        return `${padding}- ${stringifyToYaml(item, 0)}`;
      })
      .join('\n');
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value as Record<string, unknown>);
    if (keys.length === 0) return ' {}';

    return keys
      .map((key) => {
        const val = (value as Record<string, unknown>)[key];
        if (typeof val === 'object' && val !== null) {
          return `${padding}${key}:\n${stringifyToYaml(val, indent + 2)}`;
        }
        return `${padding}${key}: ${stringifyToYaml(val, 0)}`;
      })
      .join('\n');
  }

  if (typeof value === 'string') {
    if (value.includes('\n') || value.includes(':') || value.includes('#') || value.includes('-')) {
      return `"${value.replace(/"/g, '\\"')}"`;
    }
    return value;
  }

  return String(value);
}
