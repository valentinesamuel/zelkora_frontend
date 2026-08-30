import type { HmoClaimsResponse } from '@/features/dashboard/types/hmoClaims.types';

// Static, deterministic dummy payload. Money is minor units (kobo).
// Every HmoClaimStatus value appears at least once. Real Nigerian HMO names.
export const hmoClaimsFixture: HmoClaimsResponse = {
  summary: {
    pendingCount: 9,
    deniedCount: 3,
    submittedValueMinor: 88_400_000,
    // 3 denied of 24 adjudicated this period ≈ 12.5%.
    denialRatePct: 12.5,
    daysToAdjudication: 16,
  },
  claims: [
    {
      id: 'claim-7001',
      hmoName: 'Hygeia',
      patientName: 'Chinonso Okafor',
      amountMinor: 12_500_000,
      status: 'submitted',
      statusLabel: 'Submitted',
      submittedAt: '2026-08-28T11:10:00.000Z',
    },
    {
      id: 'claim-7002',
      hmoName: 'Reliance',
      patientName: 'Oluwaseun Adeyemi',
      amountMinor: 7_800_000,
      status: 'pending',
      statusLabel: 'Pending review',
      submittedAt: '2026-08-28T12:45:00.000Z',
    },
    {
      id: 'claim-7003',
      hmoName: 'AXA Mansard',
      patientName: 'Ngozi Eze',
      amountMinor: 21_000_000,
      status: 'approved',
      statusLabel: 'Approved',
      submittedAt: '2026-08-26T09:30:00.000Z',
    },
    {
      id: 'claim-7004',
      hmoName: 'Avon',
      patientName: 'Folake Ogunleye',
      amountMinor: 4_600_000,
      status: 'denied',
      statusLabel: 'Denied',
      submittedAt: '2026-08-25T15:05:00.000Z',
    },
    {
      id: 'claim-7005',
      hmoName: 'Hygeia',
      patientName: 'Halima Abubakar',
      amountMinor: 9_950_000,
      status: 'pending',
      statusLabel: 'Pending review',
      submittedAt: '2026-08-29T08:20:00.000Z',
    },
    {
      id: 'claim-7006',
      hmoName: 'Reliance',
      patientName: 'Emeka Nwachukwu',
      amountMinor: 15_300_000,
      status: 'approved',
      statusLabel: 'Approved',
      submittedAt: '2026-08-27T10:15:00.000Z',
    },
  ],
};
