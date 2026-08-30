// The working date-range control on the dashboard header row. Owns its own store
// subscription (I-1 — the page must not hoist one and thread it down). A
// bordered pill trigger showing the resolved range label; the popover body is a
// preset list that swaps in-place to a lazy-loaded calendar for "Custom…" (no
// nested popover — nested portals are a focus-management trap).

import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { CalendarDays, Check, ChevronDown, ChevronLeft } from 'lucide-react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  PRESET_LABELS,
  PRESETS,
  resolveRange,
  type PresetKey,
} from '@/features/dashboard/filters/dateRange';
import {
  todayIso,
  useDashboardFiltersStore,
} from '@/features/dashboard/filters/dashboardFiltersStore';

const DateRangeCalendar = lazy(
  () => import('@/features/dashboard/filters/DateRangeCalendar'),
);

// A fallback sized close to the loaded calendar so the popover does not resize
// under the cursor when the chunk arrives (F4-g).
const CALENDAR_FALLBACK = (
  <div className="h-64 w-64 animate-pulse rounded-sm bg-muted" aria-hidden="true" />
);

type View = 'presets' | 'calendar';

export function DateRangeControl() {
  const selection = useDashboardFiltersStore((s) => s.selection);
  const setSelection = useDashboardFiltersStore((s) => s.setSelection);

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>('presets');
  const presetsRef = useRef<HTMLDivElement>(null);

  // Always recomputed from the store — never cached at selection time, or "Today"
  // would show yesterday's date after midnight (F4-j).
  const today = todayIso();
  const { label } = resolveRange(selection, today);

  // Move focus to the first preset when the presets view is (re)shown after a
  // swap back from the calendar (F4-h). On a fresh open, view is already
  // 'presets' so this does not fire and Radix's own initial focus applies.
  useEffect(() => {
    if (view === 'presets') {
      presetsRef.current
        ?.querySelector<HTMLButtonElement>('button[data-preset]')
        ?.focus();
    }
  }, [view]);

  function choosePreset(preset: PresetKey) {
    if (preset === 'custom') {
      setView('calendar');
      return;
    }
    setSelection({ preset });
    setOpen(false);
  }

  function commitCustom(from: string, to: string) {
    setSelection({ preset: 'custom', from, to });
    setOpen(false);
  }

  function handlePresetKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
      return;
    }
    event.preventDefault();
    const buttons = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('button[data-preset]'),
    );
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      event.key === 'ArrowDown'
        ? (current + 1) % buttons.length
        : (current - 1 + buttons.length) % buttons.length;
    buttons[next]?.focus();
  }

  return (
    <>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setView('presets');
          }
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Change date range"
            className="flex h-9 items-center gap-2 rounded-sm border bg-card px-3 text-sm text-foreground transition-colors motion-reduce:transition-none hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
          >
            <CalendarDays
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="truncate">{label}</span>
            <ChevronDown
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
          </button>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-auto min-w-56 p-1">
          {view === 'presets' ? (
            <div
              ref={presetsRef}
              role="group"
              aria-label="Date range presets"
              className="flex flex-col"
              onKeyDown={handlePresetKeyDown}
            >
              {PRESETS.map((preset) => {
                const isCurrent = selection.preset === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    data-preset={preset}
                    aria-current={isCurrent ? 'true' : undefined}
                    onClick={() => choosePreset(preset)}
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors motion-reduce:transition-none hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2"
                  >
                    <Check
                      className={cn(
                        'size-4 shrink-0',
                        isCurrent ? 'opacity-100' : 'opacity-0',
                      )}
                      aria-hidden="true"
                    />
                    <span className="flex-1">{PRESET_LABELS[preset]}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setView('presets')}
                className="flex items-center gap-1 rounded-sm px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors motion-reduce:transition-none hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2"
              >
                <ChevronLeft className="size-4 shrink-0" aria-hidden="true" />
                Presets
              </button>
              <Suspense fallback={CALENDAR_FALLBACK}>
                <DateRangeCalendar
                  today={today}
                  selection={selection}
                  onCommit={commitCustom}
                />
              </Suspense>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* The control announces the resolved range itself, not only the grid (F4-l). */}
      <span className="sr-only" aria-live="polite">
        {label}
      </span>
    </>
  );
}
