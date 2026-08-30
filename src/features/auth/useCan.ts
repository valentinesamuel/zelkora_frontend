import { useAuthStore } from './authStore';
import { authorize } from './authorize';
import type { Permission } from './authorize';
import type { Role } from './types';

export interface UseCanInput {
  role?: Role[];
  permission?: Permission[];
}
 
export function useCan({ role, permission }: UseCanInput): boolean {
  const user = useAuthStore((s) => s.user);
  return authorize({ user, role, permission });
}
