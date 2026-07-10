'use client';

import { useContext, useMemo, useState } from 'react';

import { FlattenedEndpoint, ResponseState } from '@/app/components/swagger/types';
import { AuthContext } from '@/app/context/AuthProvider';
import { useSchema } from '@/app/context/SchemaContext';
import {
  compileRequestDetails,
  extractBaseUrl,
  flattenEndpoints,
  generateCurlCommand,
  parseYamlSchema,
} from '@/app/utils/SwaggerViewerParser';

export const useSwaggerViewer = () => {
  const { schema, isValid, format } = useSchema();
  const auth = useContext(AuthContext);
  const isAuthenticated = auth ? auth.isAuthenticated : false;

  const [activeInputs, setActiveInputs] = useState<Record<string, Record<string, string>>>({});
  const [requestBodies, setRequestBodies] = useState<Record<string, string>>({});
  const [responses, setResponses] = useState<Record<string, ResponseState>>({});
  const [manualBaseUrl, setManualBaseUrl] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const parsedObject = useMemo<Record<string, unknown> | null>(() => {
    if (!isValid || !schema.trim()) return null;
    try {
      if (format === 'json') {
        return JSON.parse(schema) as Record<string, unknown>;
      }
      return parseYamlSchema(schema);
    } catch {
      return null;
    }
  }, [schema, isValid, format]);

  const computedBaseUrl = useMemo<string>(() => {
    return extractBaseUrl(parsedObject, '');
  }, [parsedObject]);

  const activeBaseUrl = manualBaseUrl || computedBaseUrl;

  const endpoints = useMemo<FlattenedEndpoint[]>(() => {
    return flattenEndpoints(parsedObject);
  }, [parsedObject]);

  const handleInputChange = (endpointId: string, paramName: string, value: string) => {
    setActiveInputs((prev) => ({ ...prev, [endpointId]: { ...prev[endpointId], [paramName]: value } }));
  };

  const handleBodyChange = (endpointId: string, value: string) => {
    setRequestBodies((prev) => ({ ...prev, [endpointId]: value }));
  };

  const handleGenerateCurl = (endpoint: FlattenedEndpoint) => {
    const inputs = activeInputs[endpoint.id] || {};
    const bodyPayload = requestBodies[endpoint.id] || '';
    const { fullAbsoluteUrl, headers } = compileRequestDetails(endpoint, inputs, activeBaseUrl);
    const curlCommand = generateCurlCommand(endpoint, fullAbsoluteUrl, headers, bodyPayload);

    navigator.clipboard
      .writeText(curlCommand)
      .then(() => {
        setCopiedId(endpoint.id);
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch(() => {});
  };

  const handleExecuteRequest = async (endpoint: FlattenedEndpoint) => {
    setResponses((prev) => ({
      ...prev,
      [endpoint.id]: { status: 0, headers: {}, body: '', loading: true, latency: undefined },
    }));

    const inputs = activeInputs[endpoint.id] || {};
    const bodyPayload = requestBodies[endpoint.id] || '';
    const currentTargetBase = activeBaseUrl || 'https://wizardworldapi.com';
    const { cleanPathWithQuery, headers } = compileRequestDetails(endpoint, inputs, currentTargetBase);
    const methodUpper = endpoint.method.toUpperCase();

    const startTime = performance.now();
    let finalStatus = 500;
    let finalResponseBody = '';
    let finalHeaders: Record<string, string> = {};
    let latency = 0;

    try {
      const proxyResponse = await fetch(`${window.location.origin}/api/proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Proxy-Target-Base': activeBaseUrl,
          'X-Track-Session': isAuthenticated ? 'active' : 'inactive',
        },
        body: JSON.stringify({
          url: cleanPathWithQuery,
          method: endpoint.method,
          headers,
          body: ['POST', 'PUT', 'PATCH', 'DELETE'].includes(methodUpper) ? bodyPayload : undefined,
        }),
      });

      const result = (await proxyResponse.json()) as { status: number; headers: Record<string, string>; body: string };
      latency = Math.round(performance.now() - startTime);

      finalStatus = result.status;
      finalHeaders = result.headers;
      finalResponseBody = typeof result.body === 'object' ? JSON.stringify(result.body) : result.body;

      setResponses((prev) => ({
        ...prev,
        [endpoint.id]: { status: finalStatus, headers: finalHeaders, body: finalResponseBody, loading: false, latency },
      }));
    } catch (err: unknown) {
      latency = Math.round(performance.now() - startTime);
      const msg = err instanceof Error ? err.message : 'Network handshake failed';

      finalResponseBody = JSON.stringify({
        error: msg,
        hint: 'Verify destination endpoint availability or modify target base configuration.',
      });

      setResponses((prev) => ({
        ...prev,
        [endpoint.id]: { status: 500, headers: {}, body: finalResponseBody, loading: false, latency },
      }));
    }
  };

  return {
    isValid,
    parsedObject,
    endpoints,
    copiedId,
    activeInputs,
    requestBodies,
    responses,
    manualBaseUrl,
    computedBaseUrl,
    setManualBaseUrl,
    handleInputChange,
    handleBodyChange,
    handleGenerateCurl,
    handleExecuteRequest,
  };
};
