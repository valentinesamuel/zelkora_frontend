import { useQuery } from '@tanstack/react-query';

import { rolesKeys } from '@/features/roles/roles.keys';
import { rolesRepository } from '@/features/roles/rolesRepository';

export function useRoles() {
  return useQuery({
    queryKey: rolesKeys.list(),
    queryFn: rolesRepository.list,
  });
}
