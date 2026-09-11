import { useQuery } from '@tanstack/react-query';

import { staffKeys } from '@/features/staff/api/staff.keys';
import { staffRepository } from '@/features/staff/api/staffRepository';

export function useStaff(id: string) {
  return useQuery({
    queryKey: staffKeys.detail(id),
    queryFn: () => staffRepository.get(id),
    enabled: id !== '',
  });
}
