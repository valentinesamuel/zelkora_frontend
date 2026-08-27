// `deviceLabel` sent to POST /auth/mfa/verify must be non-empty: the backend
// binding is `binding:"required"` and an empty string is a 400 (INV-11).

export function getDeviceLabel(): string {
  const ua =
    typeof navigator !== 'undefined' && navigator.userAgent
      ? navigator.userAgent
      : 'unknown';
  return `web:${ua.slice(0, 80)}`;
}
