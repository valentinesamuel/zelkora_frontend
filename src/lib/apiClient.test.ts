import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ApiError } from './apiClient';

const BASE = 'http://localhost:8080/api/v1';

// A vi.fn() standing in for global.fetch. Re-created per test.
let fetchMock: ReturnType<typeof vi.fn>;

function successResponse(result: unknown, message = 'ok'): Response {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      statusCode: 200,
      success: true,
      message,
      result,
      path: '/x',
      duration: '1ms',
      requestId: 'req-success',
    }),
  } as unknown as Response;
}

function errorResponse(status: number, message: string): Response {
  return {
    ok: false,
    status,
    json: async () => ({
      statusCode: status,
      success: false,
      message,
      errors: ['detail'],
      path: '/x',
      duration: '1ms',
      requestId: 'req-error',
    }),
  } as unknown as Response;
}

beforeEach(() => {
  vi.resetModules();
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('apiRequest', () => {
  it('unwraps the success envelope and always sends credentials: include', async () => {
    const { apiRequest } = await import('./apiClient');
    fetchMock.mockResolvedValueOnce(successResponse({ id: 1 }));

    const result = await apiRequest<{ id: number }>('/auth/me');

    expect(result).toEqual({ id: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE}/auth/me`);
    expect(init.credentials).toBe('include');
  });

  it('throws a typed ApiError built from the error envelope', async () => {
    const { apiRequest, ApiError: ApiErrorClass } = await import('./apiClient');
    fetchMock.mockResolvedValueOnce(errorResponse(409, 'conflict'));

    const err = (await apiRequest('/auth/login', {
      method: 'POST',
      body: { email: 'a@b.c' },
    }).catch((e: unknown) => e)) as ApiError;

    expect(err).toBeInstanceOf(ApiErrorClass);
    expect(err.statusCode).toBe(409);
    expect(err.apiMessage).toBe('conflict');
    expect(err.errors).toEqual(['detail']);
    expect(err.requestId).toBe('req-error');
  });

  it('on 401 refreshes once, then replays the original request exactly once', async () => {
    const { apiRequest } = await import('./apiClient');
    const { getAccessToken } = await import('../features/auth/tokenStore');

    fetchMock
      .mockResolvedValueOnce(errorResponse(401, 'expired')) // original call
      .mockResolvedValueOnce(successResponse({ accessToken: 'new-token' })) // /auth/refresh
      .mockResolvedValueOnce(successResponse({ id: 7 })); // replay

    const result = await apiRequest<{ id: number }>('/auth/me');

    expect(result).toEqual({ id: 7 });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls.map((c) => c[0])).toEqual([
      `${BASE}/auth/me`,
      `${BASE}/auth/refresh`,
      `${BASE}/auth/me`,
    ]);
    expect(getAccessToken()).toBe('new-token');
    // The replay carried the freshly-minted bearer token.
    expect(fetchMock.mock.calls[2][1].headers.Authorization).toBe(
      'Bearer new-token',
    );
  });

  it('collapses N concurrent 401s into exactly ONE /auth/refresh call', async () => {
    const { apiRequest } = await import('./apiClient');

    const seen = new Map<string, number>();
    fetchMock.mockImplementation(async (url: string) => {
      if (url === `${BASE}/auth/refresh`) {
        return successResponse({ accessToken: 'fresh' });
      }
      const n = (seen.get(url) ?? 0) + 1;
      seen.set(url, n);
      return n === 1 ? errorResponse(401, 'expired') : successResponse({ url });
    });

    const results = await Promise.all([
      apiRequest<{ url: string }>('/a'),
      apiRequest<{ url: string }>('/b'),
      apiRequest<{ url: string }>('/c'),
    ]);

    expect(results).toEqual([
      { url: `${BASE}/a` },
      { url: `${BASE}/b` },
      { url: `${BASE}/c` },
    ]);
    const refreshCalls = fetchMock.mock.calls.filter(
      (c) => c[0] === `${BASE}/auth/refresh`,
    );
    expect(refreshCalls).toHaveLength(1);
  });

  it('fires onAuthFailure once and throws the ORIGINAL error when refresh fails', async () => {
    const { apiRequest, setOnAuthFailure } = await import('./apiClient');
    const spy = vi.fn();
    setOnAuthFailure(spy);

    fetchMock
      .mockResolvedValueOnce(errorResponse(401, 'original-expired')) // original call
      .mockResolvedValueOnce(errorResponse(401, 'refresh-rejected')); // /auth/refresh fails

    const err = (await apiRequest('/auth/me').catch(
      (e: unknown) => e,
    )) as ApiError;

    expect(err.apiMessage).toBe('original-expired');
    expect(err.statusCode).toBe(401);
    expect(spy).toHaveBeenCalledTimes(1);
    // original + refresh only; no replay.
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
