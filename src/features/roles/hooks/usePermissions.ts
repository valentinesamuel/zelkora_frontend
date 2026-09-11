import { useQuery } from '@tanstack/react-query';

import { rolesKeys } from '@/features/roles/roles.keys';
import { rolesRepository } from '@/features/roles/rolesRepository';

// Rarely changes — the permission vocabulary is seeded by migrations, not
// user-editable, so a longer `staleTime` avoids refetching it on every form
// mount.
export function usePermissions() {
  return useQuery({
    queryKey: rolesKeys.permissions(),
    queryFn: rolesRepository.permissions,
    staleTime: 5 * 60_000,
  });
}
