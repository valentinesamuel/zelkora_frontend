// The custom-range calendar view of `DateRangeControl`. A SEPARATE module with a
// DEFAULT export so `DateRangeControl` can `lazy(() => import(...))` it —
// `react-day-picker` + its `date-fns` locale code must not land in the entry
// chunk (F4-g / R10). Exports a component only (I-22); the media-query hook is
// module-local.

import { useEffect, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { format, parseISO } from 'date-fns';

import { Calendar } from '@/components/ui/calendar';
import type { RangeSelection } from '@/features/dashboard/filters/dateRange';

// Tailwind `sm` breakpoint. `numberOfMonths` is a JS prop on DayPicker, not a
// CSS concern — mirrors the established `useReducedMotion` matchMedia pattern in
// this same feature dir. Two months (~560px) do not fit at 360px.
const SM_QUERY = '(min-width: 40rem)';

function useSmUp(): boolean {
  const [smUp, setSmUp] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(SM_QUERY).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(SM_QUERY);
    const handleChange = (event: MediaQueryListEvent) => setSmUp(event.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return smUp;
}

interface DateRangeCalendarProps {
  /** Injected `YYYY-MM-DD` — the resolver's contract (I-37). */
  today: string;
  selection: RangeSelection;
  /** Called once both bounds are picked, with `YYYY-MM-DD` strings. */
  onCommit: (from: string, to: string) => void;
}

export default function DateRangeCalendar({
  today,
  selection,
  onCommit,
}: DateRangeCalendarProps) {
  const smUp = useSmUp();
  const todayDate = parseISO(today);

  const initialFrom =
    selection.preset === 'custom' && selection.from
      ? parseISO(selection.from)
      : undefined;
  const initialTo =
    selection.preset === 'custom' && selection.to
      ? parseISO(selection.to)
      : undefined;

  const [range, setRange] = useState<DateRange | undefined>(
    initialFrom ? { from: initialFrom, to: initialTo } : undefined,
  );

  function handleSelect(next: DateRange | undefined) {
    setRange(next);
    if (next?.from && next.to) {
      // `date-fns` `format()` only — a UTC conversion of a local date shifts it a
      // day west of Greenwich (F1-a).
      onCommit(format(next.from, 'yyyy-MM-dd'), format(next.to, 'yyyy-MM-dd'));
    }
  }

  return (
    <Calendar
      mode="range"
      autoFocus
      numberOfMonths={smUp ? 2 : 1}
      selected={range}
      onSelect={handleSelect}
      // Belt AND braces with `normalizeSelection` in the store setter (F4-e): a
      // future range cannot be picked in the first place.
      disabled={{ after: todayDate }}
      defaultMonth={initialFrom ?? todayDate}
    />
  );
}
