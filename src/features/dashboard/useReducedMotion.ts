import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Live `prefers-reduced-motion: reduce` state. Recharts drives its entrance
 * animations in JavaScript, so the global CSS backstop in `src/index.css`
 * cannot reach them — chart consumers pass `animate={!useReducedMotion()}` to
 * turn `isAnimationActive` off. Pure hook, no JSX: `.ts`, not `.tsx`.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(QUERY);
    const handleChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return reduced;
}
