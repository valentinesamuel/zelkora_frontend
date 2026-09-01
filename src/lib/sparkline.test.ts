import { describe, expect, it } from 'vitest';

import { sparkPoints } from './sparkline';

// Geometry-only coverage. The required matrix: empty, single value, all-equal
// (the divide-by-zero trap), negatives, and a normal ascending series.

describe('sparkPoints', () => {
  it('returns an empty string for no values', () => {
    expect(sparkPoints([], 64, 20)).toBe('');
  });

  it('places a single value at the centre of the box', () => {
    expect(sparkPoints([5], 64, 20)).toBe('32,10');
  });

  it('flattens an all-equal series to mid-height instead of emitting NaN', () => {
    const points = sparkPoints([3, 3, 3], 64, 20);
    expect(points).toBe('0,10 32,10 64,10');
    expect(points).not.toContain('NaN');
  });

  it('handles negative values without going out of the box', () => {
    expect(sparkPoints([-10, 0, 10], 64, 20)).toBe('0,20 32,10 64,0');
  });

  it('maps a normal ascending series across the full width and height', () => {
    expect(sparkPoints([0, 5, 10], 64, 20)).toBe('0,20 32,10 64,0');
  });
});
