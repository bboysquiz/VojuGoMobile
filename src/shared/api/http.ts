import type { AuthResponse } from './auth.types';

import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  saveAuthTokens,
} from './auth-token-storage';

let refreshPromise:
  | Promise<boolean>
  | null = null;

interface ApiErrorBody {
  code?: string;
  message?: string;
}

interface ApiRequestOptions
  extends Omit<RequestInit, 'body'> {
  body?: unknown;
  auth?: boolean;
  retryOnUnauthorized?: boolean;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly retryAfterSeconds?: number;

  constructor(
    message: string,
    code: string,
    status: number,
    retryAfterSeconds?: number
  ) {
    super(message);

    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export function isAbortError(error: unknown): boolean {
  return typeof error === 'object' && error !== null &&
    'name' in error && error.name === 'AbortError';
}

function getApiUrl(path: string) {
  const base =
    process.env
      .EXPO_PUBLIC_API_BASE_URL;

  if (!base) {
    throw new ApiError(
      'Не задан EXPO_PUBLIC_API_BASE_URL',
      'CONFIG_ERROR',
      0
    );
  }

  const normalizedBase =
    base.replace(/\/$/, '');

  const normalizedPath =
    path.startsWith('/')
      ? path
      : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
}

async function parseResponse(
  response: Response
): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function refreshSession(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken =
      await getRefreshToken();

    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(
        getApiUrl('/auth/refresh'),
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            refresh_token: refreshToken,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          await clearAuthTokens();
        }

        return false;
      }

      const data =
        (await response.json()) as AuthResponse;

      if (
        !data.access_token ||
        !data.refresh_token
      ) {
        return false;
      }

      await saveAuthTokens(
        data.access_token,
        data.refresh_token
      );

      return true;
    } catch {
      return false;
    }
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export async function apiRequest<T>(
  path: string,
  {
    body,
    headers: customHeaders,
    auth = true,
    retryOnUnauthorized = true,
    ...options
  }: ApiRequestOptions = {}
): Promise<T> {
  async function execute() {
    const headers =
      new Headers(customHeaders);

    headers.set(
      'Accept',
      'application/json'
    );

    if (body !== undefined) {
      headers.set(
        'Content-Type',
        'application/json'
      );
    }

    if (auth) {
      const token = getAccessToken();

      if (token) {
        headers.set(
          'Authorization',
          `Bearer ${token}`
        );
      }
    }

    return fetch(getApiUrl(path), {
      ...options,
      headers,
      body:
        body === undefined
          ? undefined
          : JSON.stringify(body),
    });
  }

  let response: Response;

  try {
    response = await execute();

    if (
      response.status === 401 &&
      auth &&
      retryOnUnauthorized
    ) {
      const refreshed =
        await refreshSession();

      if (refreshed) {
        response = await execute();
      }
    }
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new ApiError(
      'Соединение прервано. Попробуйте снова',
      'NETWORK_ERROR',
      0
    );
  }

  const responseBody =
    await parseResponse(response);

  if (!response.ok) {
    const error =
      responseBody &&
      typeof responseBody === 'object'
        ? (responseBody as ApiErrorBody)
        : null;

    const retryAfter = response.headers.get('Retry-After');
    const seconds = retryAfter === null ? NaN : /^\d+$/.test(retryAfter.trim())
      ? Number(retryAfter)
      : Math.ceil((Date.parse(retryAfter) - Date.now()) / 1000);

    throw new ApiError(
      error?.message ||
        'Ошибка при выполнении запроса',
      error?.code || 'HTTP_ERROR',
      response.status,
      Number.isFinite(seconds) ? Math.max(0, seconds) : undefined
    );
  }

  return responseBody as T;
}
