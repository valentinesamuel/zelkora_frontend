/**
 * Layout-route element for `/settings`.
 *
 * Pure shell: the page title plus a two-column region (sub-nav / routed
 * outlet). It performs no data fetching, reads no store, and imports no domain
 * slice — each settings section owns its own data.
 */
import { Outlet } from 'react-router-dom';

import { SettingsSubNav } from './components/SettingsSubNav';

export function SettingsLayout() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Settings</h1>

      <div className="mt-6 flex flex-col gap-6 md:flex-row">
        <div className="w-48 shrink-0">
          <SettingsSubNav />
        </div>
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
