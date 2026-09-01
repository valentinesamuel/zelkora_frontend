import { createDashboardQuery } from '@/features/dashboard/api/createDashboardQuery';
import { hmoClaimsFixture } from '@/features/dashboard/api/hmoClaims.fixtures';

export const useHmoClaims = createDashboardQuery('hmoClaims', hmoClaimsFixture);
