export function getDeviceLabel(): string {
  const ua =
    typeof navigator !== 'undefined' && navigator.userAgent
      ? navigator.userAgent
      : 'unknown';
  return `web:${ua.slice(0, 80)}`;
}
