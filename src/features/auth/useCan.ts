import { useAuthStore } from './authStore';
import { authorize } from './authorize';
import type { RequiredPermission } from './authorize';

export interface UseCanInput {
  permission?: RequiredPermission[];
}

export function useCan({ permission }: UseCanInput): boolean {
  const user = useAuthStore((s) => s.user);
  return authorize({ user, permission });
}
