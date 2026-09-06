/**
 * Chrome navigation configuration (Decision C2).
 *
 * This is DATA, not a component — it lives in a `.ts` module so that
 * `react-refresh/only-export-components` does not fire on the sidebar.
 *
 * Only `Dashboard`, `Patients`, and `Branches` are navigable today. Every other
 * entry is `enabled: false` and deliberately carries NO `to`, so it can never
 * be linked to by accident. `Branches` additionally carries a `permission`, so
 * `AppSidebar` hides it from users who lack `branch:read`.
 */
import {
  BarChart3,
  Building2,
  CalendarClock,
  CreditCard,
  FileCheck,
  FlaskConical,
  LayoutDashboard,
  Package,
  Pill,
  ReceiptText,
  Settings2,
  ShieldCheck,
  Stethoscope,
  UserCog,
  Users,
  UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { PERMISSIONS } from '@/features/auth/permissions';
import type { RequiredPermission } from '@/features/auth/authorize';

export interface NavItem {
  label: string;
  /** Omitted for disabled items — a disabled entry has no destination. */
  to?: string;
  icon: LucideIcon;
  enabled: boolean;
  /**
   * Optional client-side visibility gate. When set, `AppSidebar` hides the item
   * unless the user holds every listed permission. UX only — the route also
   * carries its own `RequirePermission` guard (INV-P9). Set only where a route
   * is permission-gated (currently just Branches).
   */
  permission?: RequiredPermission[];
  /**
   * Optional client-side visibility gate. When true, `AppSidebar` hides the item
   * unless `isAdmin(user)`. UX only — the route also carries its own
   * `RequireAdmin` guard (INV-P9). Set only where a route is admin-gated.
   */
  adminOnly?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        label: 'Dashboard',
        to: '/dashboard',
        icon: LayoutDashboard,
        enabled: true,
      },
    ],
  },
  {
    label: 'Patient Care',
    items: [
      { label: 'Patients', to: '/patients', icon: Users, enabled: true },
      { label: 'Queue & Appointments', icon: CalendarClock, enabled: false },
      { label: 'Consultations', icon: Stethoscope, enabled: false },
      { label: 'Lab', icon: FlaskConical, enabled: false },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Billing', icon: ReceiptText, enabled: false },
      { label: 'Claims', icon: FileCheck, enabled: false },
      { label: 'Payments', icon: CreditCard, enabled: false },
    ],
  },
  {
    label: 'People',
    items: [
      {
        label: 'Staff',
        to: '/staff',
        icon: UserCog,
        enabled: true,
        permission: [PERMISSIONS.STAFF.READ],
      },
      { label: 'Roles / Permissions', icon: ShieldCheck, enabled: false },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Pharmacy', icon: Pill, enabled: false },
      { label: 'Inventory', icon: Package, enabled: false },
      {
        label: 'Branches',
        to: '/branches',
        icon: Building2,
        enabled: true,
        permission: [PERMISSIONS.BRANCH.READ],
      },
      // `Building2` now belongs to Branches; Staffing takes `UsersRound` so no
      // two items in this group share an icon.
      { label: 'Staffing', icon: UsersRound, enabled: false },
      { label: 'Reports', icon: BarChart3, enabled: false },
    ],
  },
  {
    label: 'Administration',
    items: [
      {
        label: 'Settings',
        to: '/settings',
        icon: Settings2,
        enabled: true,
        adminOnly: true,
      },
    ],
  },
];
