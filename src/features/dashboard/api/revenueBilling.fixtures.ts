import type { RevenueBillingResponse } from '@/features/dashboard/types/revenueBilling.types';

// Static, deterministic dummy payload. All money is minor units (kobo):
// 294_050_000 kobo === ₦2,940,500.00.
export const revenueBillingFixture: RevenueBillingResponse = {
  summary: {
    totalMinor: 294_050_000,
    cashMinor: 121_500_000,
    hmoMinor: 172_550_000,
    currency: 'NGN',
    // Target ₦3,200,000.00 for the period; 294_050_000 / 320_000_000 ≈ 91.9%,
    // which is `collectionsRatePct`.
    targetMinor: 320_000_000,
    collectionsRatePct: 91.9,
    outstandingArMinor: 840_000_000,
    daysInAr: 38,
    // Daily revenue, major-unit naira; last point = totalMinor / 100.
    trend: [2_610_000, 2_540_000, 2_735_000, 2_820_000, 2_905_000, 2_860_000, 2_940_500],
  },
};
