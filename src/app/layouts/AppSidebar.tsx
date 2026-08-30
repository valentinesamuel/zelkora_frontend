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

import { useAuthStore } from '../../features/auth/authStore';
import { NAV_GROUPS } from './navigation';
import type { NavItem } from './navigation';

const COLLAPSED_STORAGE_KEY = 'zelkora.sidebar.collapsed';

/**
 * Persisted collapse state. The `try/catch` is mandatory — Safari private mode
 * and some embedded webviews throw on `localStorage` access.
 */
function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeCollapsed(value: boolean): void {
  try {
    localStorage.setItem(COLLAPSED_STORAGE_KEY, String(value));
  } catch {
    // Storage unavailable (private mode / webview) — collapse just won't persist.
  }
}

const ROW_BASE =
  'flex h-9 w-full items-center gap-3 rounded-none border-l-2 text-sm transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2';

function rowLayout(collapsed: boolean, depth: number): string {
  if (collapsed) return 'justify-center px-0';
  return depth > 0 ? 'pr-3 pl-10' : 'px-3';
}

/** `"Adebayo Okonkwo"` -> `"AO"`, `"Chidi"` -> `"C"`, `""` -> `"?"`. */
function initialsOf(fullName: string): string {
  const tokens = fullName.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return '?';
  const first = tokens[0]!.charAt(0);
  const last = tokens.length > 1 ? tokens[tokens.length - 1]!.charAt(0) : '';
  return (first + last).toUpperCase();
}

function RowIcon({ icon: Icon }: { icon: LucideIcon }) {
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
}: {
  show: boolean;
  content: string;
  children: ReactElement;
}) {
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
}: {
  item: NavItem & { to: string };
  collapsed: boolean;
  depth: number;
}) {
  return (
    <CollapsedTooltip show={collapsed} content={item.label}>
      <NavLink
        to={item.to}
        aria-label={collapsed ? item.label : undefined}
        className={({ isActive }) =>
          cn(
            ROW_BASE,
            rowLayout(collapsed, depth),
            isActive
              ? 'border-primary bg-accent-muted font-medium text-foreground'
              : 'border-transparent text-foreground hover:bg-muted',
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
}: {
  item: NavItem;
  collapsed: boolean;
  depth: number;
}) {
  return (
    <CollapsedTooltip
      show
      content={collapsed ? `${item.label} · Coming soon` : 'Coming soon'}
    >
      <a
        role="link"
        aria-disabled="true"
        tabIndex={0}
        aria-label={collapsed ? item.label : undefined}
        onClick={(event) => event.preventDefault()}
        className={cn(
          ROW_BASE,
          rowLayout(collapsed, depth),
          'cursor-default border-transparent text-muted-foreground',
        )}
      >
        <RowIcon icon={item.icon} />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </a>
    </CollapsedTooltip>
  );
}

function NavRow({
  item,
  collapsed,
  depth,
}: {
  item: NavItem;
  collapsed: boolean;
  depth: number;
}) {
  return (
    <li>
      {item.enabled && item.to !== undefined ? (
        <EnabledRow
          item={{ ...item, to: item.to }}
          collapsed={collapsed}
          depth={depth}
        />
      ) : (
        <DisabledRow item={item} collapsed={collapsed} depth={depth} />
      )}
    </li>
  );
}

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(() => readCollapsed());
  const [signingOut, setSigningOut] = useState(false);

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

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

  const initials = user === null ? '?' : initialsOf(user.fullName);

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'flex shrink-0 flex-col self-stretch border-r bg-card transition-[width] duration-[220ms] motion-reduce:transition-none',
          collapsed ? 'w-16' : 'w-[220px]',
        )}
      >
        {/* Brand + collapse toggle */}
        <div
          className={cn(
            'flex h-14 shrink-0 items-center border-b',
            collapsed ? 'justify-center px-0' : 'justify-between px-4',
          )}
        >
          {!collapsed && (
            <span className="truncate text-sm font-semibold text-foreground">Zelkora</span>
          )}
          <button
            type="button"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={toggleCollapsed}
            className="flex size-8 items-center justify-center rounded-sm text-muted-foreground transition-colors motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
          >
            {collapsed ? (
              <PanelLeft className="size-4" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav aria-label="Primary" className="min-h-0 flex-1 overflow-y-auto py-2">
          {NAV_GROUPS.map((group) => (
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
            collapsed ? 'flex-col px-0' : 'px-3',
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
                {user?.role ?? '—'}
                {user?.branchId != null && ` · ${user.branchId}`}
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
