import { createDashboardQuery } from '@/features/dashboard/api/createDashboardQuery';
import { revenueBillingFixture } from '@/features/dashboard/api/revenueBilling.fixtures';

export const useRevenueBilling = createDashboardQuery(
  'revenueBilling',
  revenueBillingFixture,
);
