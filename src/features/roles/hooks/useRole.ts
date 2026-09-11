import { useQuery } from '@tanstack/react-query';

import { rolesKeys } from '@/features/roles/roles.keys';
import { rolesRepository } from '@/features/roles/rolesRepository';

export function useRole(id: string) {
  return useQuery({
    queryKey: rolesKeys.detail(id),
    queryFn: () => rolesRepository.get(id),
    enabled: id !== '',
  });
}
