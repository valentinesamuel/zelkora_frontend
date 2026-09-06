import { useQuery } from '@tanstack/react-query';

import { staffKeys } from '@/features/staff/api/staff.keys';
import { staffRepository } from '@/features/staff/api/staffRepository';

export function useRoles() {
  return useQuery({
    queryKey: staffKeys.roles(),
    queryFn: staffRepository.roles,
    staleTime: 5 * 60_000,
  });
}
