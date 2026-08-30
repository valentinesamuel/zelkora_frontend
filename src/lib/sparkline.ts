// Pure SVG geometry for the dashboard sparkline. No React, no DOM, no side
// effects — this is the only part of the Sparkline component that vitest can
// actually cover (node env, `.ts` only).

/** Trim float noise so the emitted attribute string stays short and stable. */
const round = (n: number): number => Math.round(n * 100) / 100;

/**
 * Build the `points` attribute for an SVG `<polyline>` from a series of values,
 * mapped into a `w`×`h` box. `x` is spread evenly across `[0, w]`; `y` is
 * inverted (SVG y grows downward) so larger values sit closer to the top.
 *
 * Edge cases, all covered by the test matrix:
 *   - `[]`              → `''`            (nothing to draw)
 *   - `[v]`             → one point at the box centre
 *   - all values equal  → a flat line at mid-height (`max - min === 0` would
 *                          otherwise divide by zero and emit `NaN,NaN`)
 */
export function sparkPoints(
  values: readonly number[],
  w: number,
  h: number,
): string {
  if (values.length === 0) return "";
  if (values.length === 1) return `${round(w / 2)},${round(h / 2)}`;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const stepX = w / (values.length - 1);

  return values
    .map((v, i) => {
      const x = i * stepX;
      const y = range === 0 ? h / 2 : h - ((v - min) / range) * h;
      return `${round(x)},${round(y)}`;
    })
    .join(" ");
}
