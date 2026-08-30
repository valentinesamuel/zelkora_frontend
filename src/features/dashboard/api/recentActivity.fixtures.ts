import type { RecentActivityResponse } from '@/features/dashboard/types/recentActivity.types';

// Static, deterministic dummy payload.
export const recentActivityFixture: RecentActivityResponse = {
  entries: [
    {
      id: 'act-2001',
      actorName: 'Adaobi Nwosu',
      action: 'Completed consultation',
      targetLabel: 'Chinonso Okafor (MRN-100482)',
      occurredAt: '2026-08-29T08:25:00.000Z',
    },
    {
      id: 'act-2002',
      actorName: 'Kemi Adewale',
      action: 'Posted payment',
      targetLabel: 'Bill bill-5001 · ₦45,000',
      occurredAt: '2026-08-29T08:31:00.000Z',
    },
    {
      id: 'act-2003',
      actorName: 'Tunde Bakare',
      action: 'Submitted HMO claim',
      targetLabel: 'Claim claim-7005 · Hygeia',
      occurredAt: '2026-08-29T08:47:00.000Z',
    },
    {
      id: 'act-2004',
      actorName: 'Ngozi Okonkwo',
      action: 'Registered new patient',
      targetLabel: 'Halima Abubakar (MRN-100977)',
      occurredAt: '2026-08-29T09:03:00.000Z',
    },
    {
      id: 'act-2005',
      actorName: 'Chidi Okoro',
      action: 'Cancelled appointment',
      targetLabel: 'Folake Ogunleye · 11:00',
      occurredAt: '2026-08-29T09:18:00.000Z',
    },
    {
      id: 'act-2006',
      actorName: 'System',
      action: 'Ran nightly backup',
      targetLabel: 'Database snapshot 2026-08-29',
      occurredAt: '2026-08-29T02:00:00.000Z',
    },
  ],
};
