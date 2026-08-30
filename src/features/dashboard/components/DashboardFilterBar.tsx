import { ChevronDown } from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const FILTERS = ['Date range', 'Facility', 'Service line'] as const;

/**
 * Visual-only filter bar. Every control is inert. A `disabled` control fires no
 * pointer events, so it cannot be a Radix tooltip trigger (R14 — the same
 * pattern the sidebar's `DisabledRow` uses); the whole row is therefore a
 * focusable `<div tabIndex={0}>` that explains why nothing responds.
 */
export function DashboardFilterBar() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            tabIndex={0}
            aria-label="Dashboard filters are not yet available"
            className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3 shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {FILTERS.map((label) => (
              <span
                key={label}
                aria-disabled="true"
                className="inline-flex items-center gap-2 rounded-sm border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground"
              >
                {label}
                <ChevronDown className="size-3.5" aria-hidden="true" />
              </span>
            ))}
            <span
              aria-disabled="true"
              className="ml-auto rounded-sm px-2 py-1 text-sm text-muted-foreground"
            >
              Reset
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          Filtering arrives with live data.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
