// In-memory access-token store.
//
// This lives in its own module (NOT inside AuthContext) on purpose:
//   - `apiClient` needs to READ the token (to attach the Authorization header).
//   - `AuthContext` needs to WRITE the token (on login / refresh / logout).
// If the token lived in AuthContext, apiClient would have to import AuthContext,
// while AuthContext already imports apiClient -> circular import.
//
// INV-1: the access token lives in memory ONLY. It is never persisted to web
// storage, a non-httpOnly cookie, or the URL.

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string): void {
  accessToken = token;
}

export function clearAccessToken(): void {
  accessToken = null;
}
