/**
 * Authenticated-app chrome shell.
 *
 * Rules (carried from the former `src/app/layouts/README.md`):
 * - Chrome only. Layouts own structure and shared chrome. They do not fetch
 *   domain data, hold domain state, or implement feature behaviour — that stays
 *   in `src/features/`.
 * - Layouts may import features (`app/` is the top of the dependency graph). The
 *   reverse — a feature importing a layout — is a design smell. `src/components/**`
 *   may never import `features/**` (INV-L2, ESLint-enforced).
 * - No barrel files. Use explicit imports.
 */
import { Outlet } from 'react-router-dom';

import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';

export function AppLayout() {
  return (
    <div className="flex h-dvh overflow-hidden">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
