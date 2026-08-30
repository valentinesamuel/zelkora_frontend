/**
 * Chrome navigation configuration (Decision C2).
 *
 * This is DATA, not a component — it lives in a `.ts` module so that
 * `react-refresh/only-export-components` does not fire on the sidebar.
 *
 * Only `Dashboard` is navigable today. Every other entry is `enabled: false`
 * and deliberately carries NO `to`, so it can never be linked to by accident.
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
  ShieldCheck,
  Stethoscope,
  UserCog,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  /** Omitted for disabled items — a disabled entry has no destination. */
  to?: string;
  icon: LucideIcon;
  enabled: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        to: "/dashboard",
        icon: LayoutDashboard,
        enabled: true,
      },
    ],
  },
  {
    label: "Patient Care",
    items: [
      { label: "Patients", icon: Users, enabled: false },
      { label: "Queue & Appointments", icon: CalendarClock, enabled: false },
      { label: "Consultations", icon: Stethoscope, enabled: false },
      { label: "Lab", icon: FlaskConical, enabled: false },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Billing", icon: ReceiptText, enabled: false },
      { label: "Claims", icon: FileCheck, enabled: false },
      { label: "Payments", icon: CreditCard, enabled: false },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Staff", icon: UserCog, enabled: false },
      { label: "Roles / Permissions", icon: ShieldCheck, enabled: false },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Pharmacy", icon: Pill, enabled: false },
      { label: "Inventory", icon: Package, enabled: false },
      { label: "Staffing", icon: Building2, enabled: false },
      { label: "Reports", icon: BarChart3, enabled: false },
    ],
  },
];
