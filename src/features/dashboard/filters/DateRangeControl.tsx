import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { CalendarDays, Check, ChevronDown, ChevronLeft } from 'lucide-react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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

const CALENDAR_FALLBACK = (
  <div
    className="h-64 w-64 animate-pulse rounded-sm bg-muted"
    aria-hidden="true"
  />
);

type View = 'presets' | 'calendar';

export function DateRangeControl() {
  const selection = useDashboardFiltersStore((s) => s.selection);
  const setSelection = useDashboardFiltersStore((s) => s.setSelection);

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>('presets');
  const presetsRef = useRef<HTMLFieldSetElement>(null);

  const today = todayIso();
  const { label } = resolveRange(selection, today);

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

  const presetsPanel = (
    <fieldset
      ref={presetsRef}
      aria-label="Date range presets"
      className="flex flex-col border-0 p-0"
    >
      {PRESETS.map((preset) => {
        const isCurrent = selection.preset === preset;

        let ariaCurrent: 'true' | undefined;
        if (isCurrent) {
          ariaCurrent = 'true';
        }

        let checkOpacity = 'opacity-0';
        if (isCurrent) {
          checkOpacity = 'opacity-100';
        }

        return (
          <button
            key={preset}
            type="button"
            data-preset={preset}
            aria-current={ariaCurrent}
            onClick={() => choosePreset(preset)}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors motion-reduce:transition-none hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2"
          >
            <Check
              className={cn('size-4 shrink-0', checkOpacity)}
              aria-hidden="true"
            />
            <span className="flex-1">{PRESET_LABELS[preset]}</span>
          </button>
        );
      })}
    </fieldset>
  );

  const calendarPanel = (
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
  );

  let panel = calendarPanel;
  if (view === 'presets') {
    panel = presetsPanel;
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
          {panel}
        </PopoverContent>
      </Popover>

      {/* The control announces the resolved range itself, not only the grid (F4-l). */}
      <span className="sr-only" aria-live="polite">
        {label}
      </span>
    </>
  );
}
