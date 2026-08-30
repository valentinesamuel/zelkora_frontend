/**
 * `localStorage` access that never throws. Safari private mode and some
 * embedded webviews raise on `localStorage`, so every read/write is guarded
 * and a failure is treated as "no stored value" / "value won't persist".
 */

export function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage unavailable (private mode / webview) — the value just won't persist.
  }
}
