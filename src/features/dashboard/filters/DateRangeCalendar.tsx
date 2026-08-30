import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { format, parseISO } from 'date-fns';

import { Calendar } from '@/components/ui/calendar';
import { useMediaQuery } from '@/features/dashboard/useMediaQuery';
import type { RangeSelection } from '@/features/dashboard/filters/dateRange';

interface DateRangeCalendarProps {
  today: string;
  selection: RangeSelection;
  onCommit: (from: string, to: string) => void;
}

export default function DateRangeCalendar({
  today,
  selection,
  onCommit,
}: Readonly<DateRangeCalendarProps>) {
  // Two months (~560px) do not fit below the Tailwind `sm` breakpoint.
  const smUp = useMediaQuery('(min-width: 40rem)');
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
      disabled={{ after: todayDate }}
      defaultMonth={initialFrom ?? todayDate}
    />
  );
}
