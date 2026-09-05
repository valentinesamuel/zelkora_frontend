/**
 * Primary application navigation.
 *
 * Chrome only: it renders the nav data from `./navigation` and reads the
 * authenticated user for the footer identity block. It owns no domain state.
 *
 * Only `Dashboard` is navigable. Every other entry is rendered as a focusable
 * `aria-disabled` row (never the HTML `disabled` attribute — R14: a disabled
 * button is keyboard-unreachable and fires no pointer events, so its tooltip
 * would never be announced) wrapped in a "Coming soon" tooltip.
 */
import { useState, type ReactElement } from 'react';
import { LogOut, PanelLeft, PanelLeftClose } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { initialsOf } from '@/lib/name';
import { readStorage, writeStorage } from '@/lib/storage';
import { BranchLabel } from '@/features/branch/BranchLabel';

import { useAuthStore } from '../../features/auth/authStore';
import { authorize } from '../../features/auth/authorize';
import { NAV_GROUPS } from './navigation';
import type { NavItem } from './navigation';

const COLLAPSED_STORAGE_KEY = 'zelkora.sidebar.collapsed';

/** Persisted collapse state; absent / unreadable storage means "expanded". */
function readCollapsed(): boolean {
  return readStorage(COLLAPSED_STORAGE_KEY) === 'true';
}

function writeCollapsed(value: boolean): void {
  writeStorage(COLLAPSED_STORAGE_KEY, String(value));
}

const ROW_BASE =
  'flex h-9 w-full items-center gap-3 rounded-none text-sm transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2';

function rowLayout(collapsed: boolean, depth: number): string {
  if (collapsed) return 'justify-center px-0';
  if (depth > 0) return 'pr-3 pl-10';
  return 'px-3';
}

function RowIcon({ icon: Icon }: Readonly<{ icon: LucideIcon }>) {
  return <Icon className="size-4 shrink-0" aria-hidden="true" />;
}

/**
 * Wraps a nav row in a right-side tooltip when `show` is true; otherwise returns
 * the row untouched, so the expanded-enabled DOM is byte-identical to before.
 */
function CollapsedTooltip({
  show,
  content,
  children,
}: Readonly<{
  show: boolean;
  content: string;
  children: ReactElement;
}>) {
  if (!show) return children;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right">{content}</TooltipContent>
    </Tooltip>
  );
}

function EnabledRow({
  item,
  collapsed,
  depth,
}: Readonly<{
  item: NavItem & { to: string };
  collapsed: boolean;
  depth: number;
}>) {
  let ariaLabel: string | undefined;
  if (collapsed) {
    ariaLabel = item.label;
  }

  return (
    <CollapsedTooltip show={collapsed} content={item.label}>
      <NavLink
        to={item.to}
        aria-label={ariaLabel}
        className={({ isActive }) =>
          cn(
            ROW_BASE,
            rowLayout(collapsed, depth),
            collapsed &&
              isActive &&
              'bg-accent-muted font-medium text-foreground',
            collapsed && !isActive && 'text-foreground hover:bg-muted',
            !collapsed &&
              isActive &&
              'border-l-2 border-primary bg-accent-muted font-medium text-foreground',
            !collapsed &&
              !isActive &&
              'border-l-2 border-transparent text-foreground hover:bg-muted',
          )
        }
      >
        <RowIcon icon={item.icon} />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </NavLink>
    </CollapsedTooltip>
  );
}

function DisabledRow({
  item,
  collapsed,
  depth,
}: Readonly<{
  item: NavItem;
  collapsed: boolean;
  depth: number;
}>) {
  let tooltipContent = 'Coming soon';
  if (collapsed) {
    tooltipContent = `${item.label} · Coming soon`;
  }

  let ariaLabel: string | undefined;
  if (collapsed) {
    ariaLabel = item.label;
  }

  let stateClass =
    'cursor-default border-l-2 border-transparent text-muted-foreground';
  if (collapsed) {
    stateClass = 'cursor-default text-muted-foreground';
  }

  return (
    <CollapsedTooltip show content={tooltipContent}>
      <button
        type="button"
        aria-disabled="true"
        tabIndex={0}
        aria-label={ariaLabel}
        onClick={(event) => event.preventDefault()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
            event.preventDefault();
          }
        }}
        className={cn(ROW_BASE, rowLayout(collapsed, depth), stateClass)}
      >
        <RowIcon icon={item.icon} />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </button>
    </CollapsedTooltip>
  );
}

function NavRow({
  item,
  collapsed,
  depth,
}: Readonly<{
  item: NavItem;
  collapsed: boolean;
  depth: number;
}>) {
  let row = <DisabledRow item={item} collapsed={collapsed} depth={depth} />;
  if (item.enabled && item.to !== undefined) {
    row = (
      <EnabledRow
        item={{ ...item, to: item.to }}
        collapsed={collapsed}
        depth={depth}
      />
    );
  }

  return <li>{row}</li>;
}

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(() => readCollapsed());
  const [signingOut, setSigningOut] = useState(false);

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  // Drop items the user cannot see (client-side UX gate — the route enforces
  // its own `RequirePermission`), then drop any group left with no items.
  // `authorize` is a pure predicate, safe to call in a loop (not a hook).
  const navGroups = NAV_GROUPS.map((group) => ({
    label: group.label,
    items: group.items.filter(
      (item) =>
        item.permission === undefined ||
        authorize({ user, permission: item.permission }),
    ),
  })).filter((group) => group.items.length > 0);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    writeCollapsed(next);
  }

  async function handleSignOut() {
    setSigningOut(true);
    await logout();
    navigate('/login', { replace: true });
  }

  let initials = '?';
  if (user !== null) {
    initials = initialsOf(user.fullName);
  }

  let asideWidth = 'w-55';
  if (collapsed) {
    asideWidth = 'w-16';
  }

  let brandRowClass = 'justify-between px-4';
  if (collapsed) {
    brandRowClass = 'justify-center px-0';
  }

  let identityRowClass = 'px-3';
  if (collapsed) {
    identityRowClass = 'flex-col px-0';
  }

  let toggleLabel = 'Collapse sidebar';
  if (collapsed) {
    toggleLabel = 'Expand sidebar';
  }

  let toggleIcon = <PanelLeftClose className="size-4" aria-hidden="true" />;
  if (collapsed) {
    toggleIcon = <PanelLeft className="size-4" aria-hidden="true" />;
  }

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'flex shrink-0 flex-col self-stretch border-r bg-card transition-[width] duration-220 motion-reduce:transition-none',
          asideWidth,
        )}
      >
        {/* Brand + collapse toggle */}
        <div
          className={cn(
            'flex h-14 shrink-0 items-center border-b',
            brandRowClass,
          )}
        >
          {!collapsed && (
            <span className="truncate text-sm font-semibold text-foreground">
              Zelkora
            </span>
          )}
          <button
            type="button"
            aria-label={toggleLabel}
            onClick={toggleCollapsed}
            className="flex size-8 items-center justify-center rounded-sm text-muted-foreground transition-colors motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
          >
            {toggleIcon}
          </button>
        </div>

        {/* Navigation */}
        <nav
          aria-label="Primary"
          className="min-h-0 flex-1 overflow-y-auto py-2"
        >
          {navGroups.map((group) => (
            <div key={group.label} className="mb-2">
              {!collapsed && (
                <p className="px-3 py-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  {group.label}
                </p>
              )}
              <ul className="list-none">
                {group.items.map((item) => (
                  <NavRow
                    key={item.label}
                    item={item}
                    collapsed={collapsed}
                    depth={0}
                  />
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Identity + sign out */}
        <div
          className={cn(
            'flex shrink-0 items-center gap-2 border-t py-3',
            identityRowClass,
          )}
        >
          <span
            aria-hidden="true"
            className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-muted text-[11px] font-medium text-foreground"
          >
            {initials}
          </span>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {user?.fullName ?? 'Unknown user'}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.roleName ?? '—'}
                <BranchLabel />
              </p>
            </div>
          )}

          <button
            type="button"
            aria-label="Sign out"
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex size-8 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 disabled:opacity-50"
          >
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
