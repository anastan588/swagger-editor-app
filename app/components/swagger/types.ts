export interface ParameterSpec {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  required?: boolean;
  schema?: {
    type?: string;
    format?: string;
  };
}

export interface ResponseContentSpec {
  schema?: {
    type?: string;
    items?: {
      $ref?: string;
    };
    $ref?: string;
  };
}

export interface OperationSpec {
  tags?: string[];
  summary?: string;
  parameters?: ParameterSpec[];
  requestBody?: {
    content?: Record<string, ResponseContentSpec>;
  };
  responses?: Record<
    string,
    {
      description: string;
      content?: Record<string, ResponseContentSpec>;
    }
  >;
}

export type PathItemSpec = Record<string, OperationSpec>;

export interface FlattenedEndpoint {
  id: string;
  path: string;
  method: string;
  spec: OperationSpec;
}

export interface ResponseState {
  status: number;
  headers: Record<string, string>;
  body: string;
  loading: boolean;
  latency?: number;
  size?: string;
  requestUrl?: string;
}

export interface ProxyBodyPayload {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
}

export interface EndpointRowProps {
  endpoint: FlattenedEndpoint;
  inputs: Record<string, string>;
  requestBody: string;
  responseState: ResponseState | undefined;
  copiedId: string | null;
  onInputChange: (paramName: string, value: string) => void;
  onBodyChange: (value: string) => void;
  onExecute: () => void;
  onGenerateCurl: () => void;
}

export interface RequestHistoryData {
  id: string;
  method: string;
  path: string;
  target_host: string;
  response_status: number;
  latency_ms: number;
  request_size_bytes: number;
  response_size_bytes: number;
  error_details: string | null;
  request_body: string | null;
  response_body: string | null;
  created_at: string;
}

export const BADGE_THEMES: Record<string, string> = {
  GET: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50',
  POST: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/50',
  PUT: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/50',
  DELETE: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/50',
};

export const DEFAULT_BADGE =
  'bg-neutral-50 text-neutral-700 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-400';
