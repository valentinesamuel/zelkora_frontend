/**
 * Left sub-navigation for the Settings area.
 *
 * Chrome only: it renders `SETTINGS_SECTIONS` and owns no domain state. A
 * section is a real link only when `enabled` is true; every disabled section is
 * a focusable `aria-disabled` row (never the HTML `disabled` attribute — R14: a
 * disabled button is keyboard-unreachable and fires no pointer events, so its
 * tooltip would never be announced) wrapped in a "Coming soon" tooltip.
 *
 * The row styling is a deliberate LOCAL COPY of `AppSidebar`'s, minus the
 * collapsed/icon/depth variants: this nav is always expanded and icon-less, and
 * it must be free to drift from the primary sidebar.
 */
import { NavLink } from 'react-router-dom';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import { SETTINGS_SECTIONS } from '../settingsNav';
import type { SettingsSection } from '../settingsNav';

const COMING_SOON = 'Coming soon';

const ROW_BASE =
  'flex h-9 w-full items-center gap-3 rounded-none px-3 text-sm transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2';

const ROW_ACTIVE =
  'border-l-2 border-primary bg-accent-muted font-medium text-foreground';

const ROW_INACTIVE =
  'border-l-2 border-transparent text-foreground hover:bg-muted';

const ROW_DISABLED =
  'cursor-default border-l-2 border-transparent text-muted-foreground';

function EnabledSectionRow({ section }: Readonly<{ section: SettingsSection }>) {
  return (
    <NavLink
      to={section.to}
      className={({ isActive }) =>
        cn(ROW_BASE, isActive && ROW_ACTIVE, !isActive && ROW_INACTIVE)
      }
    >
      <span className="truncate">{section.label}</span>
    </NavLink>
  );
}

function DisabledSectionRow({
  section,
}: Readonly<{ section: SettingsSection }>) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-disabled="true"
          tabIndex={0}
          onClick={(event) => event.preventDefault()}
          onKeyDown={(event) => {
            if (
              event.key === 'Enter' ||
              event.key === ' ' ||
              event.key === 'Spacebar'
            ) {
              event.preventDefault();
            }
          }}
          className={cn(ROW_BASE, ROW_DISABLED)}
        >
          <span className="truncate">{section.label}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">{COMING_SOON}</TooltipContent>
    </Tooltip>
  );
}

function SectionRow({ section }: Readonly<{ section: SettingsSection }>) {
  if (section.enabled) return <EnabledSectionRow section={section} />;
  return <DisabledSectionRow section={section} />;
}

export function SettingsSubNav() {
  return (
    <TooltipProvider>
      <nav aria-label="Settings sections">
        <ul className="list-none">
          {SETTINGS_SECTIONS.map((section) => (
            <li key={section.label}>
              <SectionRow section={section} />
            </li>
          ))}
        </ul>
      </nav>
    </TooltipProvider>
  );
}
