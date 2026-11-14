// Central API client adhering to Section 8 of the Master Prompt
// Connects to FastAPI backend running at http://localhost:8000

const DEFAULT_BASE_URL = 'http://localhost:8000/api';
const DEFAULT_TIMEOUT_MS = 6000;

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.replace(/\/+$/, '');
  }
  return DEFAULT_BASE_URL;
}

export function buildApiUrl(endpoint: string): string {
  const base = getApiBaseUrl().replace(/\/+$/, '');
  let path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (base.endsWith('/api') && path.startsWith('/api/')) {
    path = path.slice(4);
  } else if (!base.endsWith('/api') && !path.startsWith('/api/')) {
    path = `/api${path}`;
  }
  return `${base}${path}`;
}

export async function apiRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: unknown
): Promise<T> {
  const url = buildApiUrl(endpoint);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorDetails: unknown = null;
      try {
        errorDetails = await response.json();
      } catch {
        errorDetails = await response.text();
      }
      throw new ApiError(
        `API request failed with status ${response.status}: ${
          typeof errorDetails === 'object' && errorDetails && 'detail' in errorDetails
            ? JSON.stringify((errorDetails as any).detail)
            : response.statusText
        }`,
        response.status,
        errorDetails
      );
    }

    const data = await response.json();
    return data as T;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) throw err;
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError('Request timed out after 6 seconds', 408);
    }
    throw new ApiError(
      err instanceof Error ? err.message : 'Network request failed',
      0,
      err
    );
  }
}
