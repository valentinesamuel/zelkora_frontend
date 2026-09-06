import { useQuery } from '@tanstack/react-query';

import { staffKeys } from '@/features/staff/api/staff.keys';
import { staffRepository } from '@/features/staff/api/staffRepository';

export function useDepartments() {
  return useQuery({
    queryKey: staffKeys.departments(),
    queryFn: staffRepository.departments,
  });
}
