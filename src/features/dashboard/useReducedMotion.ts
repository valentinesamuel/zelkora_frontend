import { useMediaQuery } from '@/features/dashboard/useMediaQuery';

// Recharts drives its entrance animations in JavaScript, so the global CSS
// backstop in `src/index.css` cannot reach them — chart consumers pass
// `animate={!useReducedMotion()}` to turn `isAnimationActive` off.
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
