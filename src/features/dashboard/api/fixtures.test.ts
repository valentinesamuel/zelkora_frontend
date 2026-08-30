import { describe, expect, it } from 'vitest';

import { dashboardKpisFixture } from '@/features/dashboard/api/dashboardKpis.fixtures';
import { revenueBillingFixture } from '@/features/dashboard/api/revenueBilling.fixtures';
import { hmoClaimsFixture } from '@/features/dashboard/api/hmoClaims.fixtures';
import { edFlowFixture } from '@/features/dashboard/api/edFlow.fixtures';
import { dischargeReadinessFixture } from '@/features/dashboard/api/dischargeReadiness.fixtures';
import { qualitySafetyFixture } from '@/features/dashboard/api/qualitySafety.fixtures';

const INTENTS = ['good', 'bad', 'neutral'] as const;
const isInteger = (n: number) => Number.isInteger(n);
const isFinitePct = (n: number) => Number.isFinite(n) && n >= 0 && n <= 100;

describe('dashboardKpis fixture', () => {
  it('has four items with well-formed sparklines and intents', () => {
    expect(dashboardKpisFixture.items).toHaveLength(4);
    for (const item of dashboardKpisFixture.items) {
      expect(item.spark.length).toBeGreaterThanOrEqual(7);
      expect(item.spark.every((n) => Number.isFinite(n))).toBe(true);
      expect(INTENTS).toContain(item.deltaIntent);
      expect(Number.isFinite(item.value)).toBe(true);
      expect(item.display.length).toBeGreaterThan(0);
    }
  });

  it("last spark point tracks the item's value", () => {
    for (const item of dashboardKpisFixture.items) {
      expect(item.spark[item.spark.length - 1]).toBeCloseTo(item.value, 5);
    }
  });
});

describe('revenueBilling fixture', () => {
  const s = revenueBillingFixture.summary;

  it('money fields are integer minor units', () => {
    for (const v of [s.totalMinor, s.cashMinor, s.hmoMinor, s.targetMinor, s.outstandingArMinor]) {
      expect(isInteger(v)).toBe(true);
    }
  });

  it('cash + hmo reconciles to total', () => {
    expect(s.cashMinor + s.hmoMinor).toBe(s.totalMinor);
  });

  it('collections rate is a 0–100 percentage roughly equal to total / target', () => {
    expect(isFinitePct(s.collectionsRatePct)).toBe(true);
    expect(s.collectionsRatePct).toBeCloseTo((s.totalMinor / s.targetMinor) * 100, 0);
  });

  it('trend has >= 2 points and ends at total in major units', () => {
    expect(s.trend.length).toBeGreaterThanOrEqual(2);
    expect(s.trend.every((n) => Number.isFinite(n))).toBe(true);
    expect(s.trend[s.trend.length - 1]).toBe(s.totalMinor / 100);
  });

  it('daysInAr is a positive integer', () => {
    expect(isInteger(s.daysInAr)).toBe(true);
    expect(s.daysInAr).toBeGreaterThan(0);
  });
});

describe('hmoClaims fixture', () => {
  const s = hmoClaimsFixture.summary;

  it('counts are non-negative integers', () => {
    for (const v of [s.pendingCount, s.deniedCount, s.daysToAdjudication]) {
      expect(isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
    }
  });

  it('submitted value is integer minor units', () => {
    expect(isInteger(s.submittedValueMinor)).toBe(true);
  });

  it('denial rate is a 0–100 percentage', () => {
    expect(isFinitePct(s.denialRatePct)).toBe(true);
  });
});

describe('edFlow fixture', () => {
  it('has >= 7 points with positive integer visits and finite waits', () => {
    expect(edFlowFixture.points.length).toBeGreaterThanOrEqual(7);
    for (const p of edFlowFixture.points) {
      expect(p.day.length).toBeGreaterThan(0);
      expect(isInteger(p.visits)).toBe(true);
      expect(p.visits).toBeGreaterThan(0);
      expect(Number.isFinite(p.avgWaitMin)).toBe(true);
      expect(p.avgWaitMin).toBeGreaterThan(0);
    }
  });
});

describe('dischargeReadiness fixture', () => {
  it('all buckets are non-negative integers', () => {
    const { readyNow, readySoon, notReady } = dischargeReadinessFixture;
    for (const v of [readyNow, readySoon, notReady]) {
      expect(isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('qualitySafety fixture', () => {
  it('has four indicators with valid intents and non-empty displays', () => {
    expect(qualitySafetyFixture.indicators).toHaveLength(4);
    for (const ind of qualitySafetyFixture.indicators) {
      expect(ind.id.length).toBeGreaterThan(0);
      expect(ind.label.length).toBeGreaterThan(0);
      expect(ind.display.length).toBeGreaterThan(0);
      expect(INTENTS).toContain(ind.deltaIntent);
    }
  });

  it('indicator ids are unique', () => {
    const ids = qualitySafetyFixture.indicators.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
