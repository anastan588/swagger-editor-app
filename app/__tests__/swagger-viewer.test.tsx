import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SwaggerViewer } from '@/app/components/swagger/SwaggerViewer';
import { EndpointRowProps, FlattenedEndpoint, ResponseState } from '@/app/components/swagger/types';
import * as ParserUtils from '@/app/utils/SwaggerViewerParser';

interface SchemaContextState {
  format: string;
  isValid: boolean;
  schema: string;
}

interface SwaggerViewerHookState {
  isValid: boolean;
  format: string;
  parsedObject: Record<string, unknown> | null;
  endpoints: FlattenedEndpoint[];
  copiedId: string | null;
  activeInputs: Record<string, Record<string, string>>;
  requestBodies: Record<string, string>;
  responses: Record<string, ResponseState>;
  manualBaseUrl: string;
  computedBaseUrl: string;
  setManualBaseUrl: (val: string) => void;
  handleInputChange: (endpointId: string, paramName: string, value: string) => void;
  handleBodyChange: (endpointId: string, value: string) => void;
  handleGenerateCurl: (endpoint: FlattenedEndpoint) => void;
  handleExecuteRequest: (endpoint: FlattenedEndpoint) => Promise<void>;
}

const mockUseSwaggerViewer = vi.fn();
vi.mock('@/app/hooks/useSwaggerViewer', () => ({
  useSwaggerViewer: () => mockUseSwaggerViewer(),
}));

const mockSchemaContext = vi.fn<() => SchemaContextState>();
vi.mock('@/app/context/SchemaContextValue', () => ({
  useSchema: () => mockSchemaContext(),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, string>) => {
    if (key === 'detected' && values) return `Detected ${values.format}`;
    return key;
  },
}));

vi.mock('./EndpointRow', () => ({
  EndpointRow: ({ endpoint, onExecute }: EndpointRowProps) => (
    <div data-testid={`endpoint-${endpoint.id}`}>
      <span>{endpoint.path}</span>
      <button data-testid={`execute-${endpoint.id}`} type="button" onClick={onExecute}>
        Execute
      </button>
    </div>
  ),
}));

describe('SwaggerViewer', () => {
  let defaultHookState: SwaggerViewerHookState;
  let mockEndpoints: FlattenedEndpoint[];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(JSON, 'parse').mockImplementation(() => ({ openapi: '3.0.0' }));

    const fakeEndpoints = [
      { id: 'get-users', path: '/users', method: 'get', spec: { summary: 'Get users', responses: {} } },
      { id: 'post-user', path: '/users', method: 'post', spec: { summary: 'Create user', responses: {} } },
    ];

    vi.spyOn(ParserUtils, 'parseYamlSchema').mockImplementation(() => ({ openapi: '3.0.0' }));
    vi.spyOn(ParserUtils, 'extractBaseUrl').mockImplementation(() => 'https://example.com');
    vi.spyOn(ParserUtils, 'flattenEndpoints').mockImplementation(() => fakeEndpoints);

    mockEndpoints = fakeEndpoints;

    defaultHookState = {
      isValid: true,
      format: 'json',
      parsedObject: { openapi: '3.0.0' },
      endpoints: mockEndpoints,
      copiedId: null,
      activeInputs: {},
      requestBodies: {},
      responses: {},
      manualBaseUrl: '',
      computedBaseUrl: 'https://example.com',
      setManualBaseUrl: vi.fn(),
      handleInputChange: vi.fn(),
      handleBodyChange: vi.fn(),
      handleGenerateCurl: vi.fn(),
      handleExecuteRequest: vi.fn(),
    };

    mockUseSwaggerViewer.mockImplementation(() => defaultHookState);
    mockSchemaContext.mockReturnValue({ format: 'json', isValid: true, schema: '{}' });
  });

  it('renders loading state when schema is invalid or null', () => {
    vi.spyOn(JSON, 'parse').mockImplementation(() => null);
    mockSchemaContext.mockReturnValue({ format: 'json', isValid: false, schema: '' });
    mockUseSwaggerViewer.mockImplementation(() => ({
      ...defaultHookState,
      isValid: false,
      parsedObject: null,
      endpoints: [],
    }));

    render(<SwaggerViewer />);

    expect(screen.getByText('awaitingConfig')).toBeInTheDocument();
    expect(screen.queryByText('serverTargetHost')).not.toBeInTheDocument();
  });

  it('renders correct format tag when schema format is yaml', () => {
    mockSchemaContext.mockReturnValue({ format: 'yaml', isValid: true, schema: 'openapi: 3.0.0' });
    render(<SwaggerViewer />);

    expect(screen.getByText('Detected YAML')).toBeInTheDocument();
  });

  it('uses computedBaseUrl as input placeholder and reflects manualBaseUrl value', () => {
    defaultHookState.manualBaseUrl = 'https://custom.com';
    defaultHookState.computedBaseUrl = 'https://computed.com';

    const { container } = render(<SwaggerViewer />);

    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.placeholder).toBe('https://computed.com');
    expect(input.value).toBe('https://custom.com');
  });

  it('calls setManualBaseUrl when target host input changes', () => {
    const setManualBaseUrlMock = vi.fn();
    defaultHookState.setManualBaseUrl = setManualBaseUrlMock;

    const { container } = render(<SwaggerViewer />);

    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'https://new-url.com' } });

    expect(setManualBaseUrlMock).toHaveBeenCalled();
  });
});
