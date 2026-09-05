// The visible branch control, mounted in `AppHeader`'s right cell. A feature
// component — the chrome stays dumb (I-39), so this file owns the store
// subscription and calls `useBranchHydration()` itself.
//
// Phase 4: live data. Sources active branches from `useActiveBranches()` (D8 —
// constant query key, shared with `BranchLabel` and `useBranchHydration`, so
// three mounts cost one request). Degrades to `null` on 403 / error / empty
// (D4). The narrow-viewport label is the real `code` field, not a fabricated
// short name (D3 / INV-B15).

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { PERMISSIONS } from '@/features/auth/permissions';
import { useCan } from '@/features/auth/useCan';
import { useActiveBranches } from '@/features/branch/api/branches.api';
import { useBranchHydration } from '@/features/branch/useBranchHydration';
import { useDashboardFiltersStore } from '@/features/dashboard/filters/dashboardFiltersStore';

export function BranchSwitcher() {
  useBranchHydration();

  const branchId = useDashboardFiltersStore((s) => s.branchId);
  const setBranchId = useDashboardFiltersStore((s) => s.setBranchId);

  // D4 pre-flight: a user who provably lacks `branch:read` never issues the
  // guaranteed-403 request. The error path below is still the real backstop —
  // client-side `authorize()` is UX-only and can disagree with the server.
  const canRead = useCan({ permission: [PERMISSIONS.BRANCH.READ] });
  const { data, isPending, isError } = useActiveBranches({ enabled: canRead });

  const branches = data?.data ?? [];

  // Silent degradation (D4): render nothing rather than an error artifact that
  // sits permanently in the header for a user who cannot act on it. A genuine
  // single-branch deployment is now a real case, so `< 2` is data-driven, not
  // just defensive.
  if (!canRead || isPending || isError || branches.length < 2) {
    return null;
  }

  // No `?? branches[0]` fallback — that lied about the active scope. When the
  // selected branch is not in the active set, reconciliation (INV-B5) owns
  // correcting the store; the switcher renders nothing until it does.
  const active = branches.find((b) => b.id === branchId) ?? null;
  if (active === null) {
    return null;
  }

  return (
    <Select value={active.id} onValueChange={setBranchId}>
      <SelectTrigger
        aria-label="Switch branch"
        title={active.name}
        className="h-8 min-w-0 truncate rounded-sm border text-sm focus-visible:border-input focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
      >
        {/* Two spans, not a JS breakpoint read — no matchMedia, no resize
            listener, no hydration mismatch (INV-B14). `code` below sm, full
            name at sm and up (D3). */}
        <span className="truncate sm:hidden">{active.code}</span>
        <span className="hidden truncate sm:inline">{active.name}</span>
      </SelectTrigger>
      <SelectContent>
        {branches.map((branch) => (
          <SelectItem key={branch.id} value={branch.id}>
            {branch.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
