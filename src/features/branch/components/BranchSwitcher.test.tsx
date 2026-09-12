// Selecting a branch must clear the shared `queryClient` cache entirely — not
// just update the store — so no view can ever show data left over from the
// previously selected branch. This exercises the REAL singleton from
// `@/app/providers/queryClient`, not a locally constructed one, since the
// guarantee is specifically that the app-wide cache is emptied.

import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { queryClient } from '@/app/providers/queryClient';
import { BranchSwitcher } from '@/features/branch/components/BranchSwitcher';
import type { ActiveBranch } from '@/features/branch/api/branches.api';
import { useAuthStore } from '@/features/auth/authStore';
import { useDashboardFiltersStore } from '@/features/dashboard/filters/dashboardFiltersStore';
import type { User } from '@/features/auth/types';

vi.mock('@/features/branch/api/branches.api', () => ({
  useActiveBranches: () => ({
    data: {
      data: [
        { id: 'branch-a', name: 'Branch A', code: 'BR001', isActive: true },
        { id: 'branch-b', name: 'Branch B', code: 'BR002', isActive: true },
      ] satisfies ActiveBranch[],
    },
  }),
}));

function user(overrides: Partial<User> = {}): User {
  return {
    id: 'u1',
    email: 'admin@example.com',
    fullName: 'Admin User',
    roleId: 'r1',
    roleName: 'admin',
    branchId: 'branch-a',
    permissions: ['branch:read'],
    ...overrides,
  };
}

function renderSwitcher() {
  return render(
    <QueryClientProvider client={queryClient}>
      <BranchSwitcher />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  useAuthStore.setState({ user: user(), status: 'authed' });
  useDashboardFiltersStore.setState({ branchId: 'branch-a' });
});

afterEach(() => {
  cleanup();
  queryClient.clear();
});

describe('BranchSwitcher', () => {
  it('clears the shared query cache when a different branch is selected', async () => {
    // Seed the real singleton cache with a query, as if data had already
    // been fetched under the previously active branch.
    queryClient.setQueryData(['dashboard', 'summary', 'branch-a'], {
      total: 42,
    });
    expect(queryClient.getQueryCache().getAll()).toHaveLength(1);

    const ue = userEvent.setup();
    renderSwitcher();

    await ue.click(screen.getByRole('button', { name: /active branch/i }));
    await ue.click(await screen.findByText('Branch B'));

    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
    expect(useDashboardFiltersStore.getState().branchId).toBe('branch-b');
  });
});
