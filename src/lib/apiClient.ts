// The single HTTP seam for the whole frontend (INV-14: all HTTP goes through here).
//
// Responsibilities:
//   - Build the request URL from VITE_API_BASE_URL.
//   - Always send `credentials: 'include'` (INV-8) so the httpOnly `refresh_token`
//     cookie is stored on login and sent on refresh.
//   - Attach `Authorization: Bearer <token>` from the in-memory token store.
//   - Parse the backend envelope: success is ALWAYS HTTP 200 with `success:true`;
//     errors carry real statuses with `success:false`.
//   - On 401, transparently refresh the access token (single-flight) and replay
//     the original request exactly once.
//
// INV-13: this module NEVER imports AuthContext. It reads the token via
// `tokenStore` and signals auth failure via a registered callback.
// INV-2 / INV-21: the refresh token is never read or logged here; nothing logs
// token material at all.

import { getAccessToken, setAccessToken } from '../features/auth/tokenStore';

// Typed error surfaced to callers. UI renders `apiMessage` (the backend's
// human-readable string). `requestId` correlates with backend logs.
export class ApiError extends Error {
  statusCode: number;
  apiMessage: string;
  errors: string[];
  requestId: string;

  constructor(
    statusCode: number,
    apiMessage: string,
    errors: string[],
    requestId: string,
  ) {
    super(apiMessage);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.apiMessage = apiMessage;
    this.errors = errors;
    this.requestId = requestId;
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST';
  body?: unknown;
  token?: string; // explicit override, e.g. enrollmentToken
  skipAuth?: boolean; // send no Authorization header at all
  skipRefreshRetry?: boolean;
}

// ---------------------------------------------------------------------------
// Auth-failure callback registration (F2.7).
// Registered once by AuthProvider (F3). Keeps the dependency arrow
// AuthContext -> apiClient one-directional.
// ---------------------------------------------------------------------------

type AuthFailureCallback = () => void;

let onAuthFailure: AuthFailureCallback = () => {};

export function setOnAuthFailure(cb: AuthFailureCallback): void {
  onAuthFailure = cb;
}

// ---------------------------------------------------------------------------
// Envelope helpers
// ---------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toApiError(parsed: unknown, fallbackStatus: number): ApiError {
  if (isRecord(parsed) && parsed.success === false) {
    const statusCode =
      typeof parsed.statusCode === 'number' ? parsed.statusCode : fallbackStatus;
    const apiMessage =
      typeof parsed.message === 'string' ? parsed.message : 'Request failed';
    const errors = Array.isArray(parsed.errors)
      ? parsed.errors.filter((e): e is string => typeof e === 'string')
      : [];
    const requestId =
      typeof parsed.requestId === 'string' ? parsed.requestId : '';
    return new ApiError(statusCode, apiMessage, errors, requestId);
  }
  // Not the expected envelope (e.g. a proxy / HTML error page).
  return new ApiError(fallbackStatus, 'Request failed', [], '');
}

// ---------------------------------------------------------------------------
// Single-flight refresh (F2.6).
//
// At most ONE POST /auth/refresh is ever in flight process-wide (INV-3).
// The backend rotates the refresh token atomically: two concurrent refreshes
// with the same cookie value means the second presents an already-revoked
// token -> forced logout. `inFlight` is cleared in `finally` so a failed
// refresh never permanently poisons the module.
// ---------------------------------------------------------------------------

let inFlight: Promise<string> | null = null;

interface RefreshResult {
  accessToken: string;
}

function refreshOnce(): Promise<string> {
  if (inFlight !== null) {
    return inFlight;
  }
  inFlight = (async () => {
    const result = await apiRequest<RefreshResult>('/auth/refresh', {
      method: 'POST',
      skipAuth: true,
      skipRefreshRetry: true,
    });
    setAccessToken(result.accessToken);
    return result.accessToken;
  })().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

// ---------------------------------------------------------------------------
// Core request (F2.4 / F2.5)
// ---------------------------------------------------------------------------

export function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  return sendRequest<T>(path, options, false);
}

async function sendRequest<T>(
  path: string,
  options: RequestOptions,
  retried: boolean,
): Promise<T> {
  const {
    method = 'GET',
    body,
    token,
    skipAuth = false,
    skipRefreshRetry = false,
  } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const authToken = token ?? (skipAuth ? undefined : getAccessToken() ?? undefined);
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let parsed: unknown;
  try {
    parsed = await res.json();
  } catch {
    parsed = null;
  }

  if (res.ok && isRecord(parsed) && parsed.success === true) {
    return (parsed as { result: T }).result;
  }

  const apiError = toApiError(parsed, res.status);

  if (
    res.status === 401 &&
    !skipRefreshRetry &&
    !retried &&
    path !== '/auth/refresh'
  ) {
    try {
      await refreshOnce();
    } catch {
      onAuthFailure();
      throw apiError;
    }
    // Replay the original request EXACTLY ONCE.
    return sendRequest<T>(path, { ...options, skipRefreshRetry: true }, true);
  }

  throw apiError;
}
