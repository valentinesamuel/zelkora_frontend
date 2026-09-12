import { useEffect, useState } from 'react';

// Returns `value`, delayed by `delayMs` after the last time it changed. Any
// change that arrives before the delay elapses cancels the pending update, so
// a rapid burst of changes only ever settles on the final value.
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebounced(value);
    }, delayMs);

    return () => clearTimeout(timeoutId);
  }, [value, delayMs]);

  return debounced;
}
