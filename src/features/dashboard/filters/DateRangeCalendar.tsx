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
  const smUp = useMediaQuery('(min-width: 40rem)');
  const todayDate = parseISO(today);

  const isCustom = selection.preset === 'custom';

  let initialFrom: Date | undefined;
  if (isCustom && selection.from) {
    initialFrom = parseISO(selection.from);
  }

  let initialTo: Date | undefined;
  if (isCustom && selection.to) {
    initialTo = parseISO(selection.to);
  }

  let initialRange: DateRange | undefined;
  if (initialFrom) {
    initialRange = { from: initialFrom, to: initialTo };
  }

  const [range, setRange] = useState<DateRange | undefined>(initialRange);

  function handleSelect(next: DateRange | undefined) {
    setRange(next);
    if (next?.from && next.to) {
      onCommit(format(next.from, 'yyyy-MM-dd'), format(next.to, 'yyyy-MM-dd'));
    }
  }

  let numberOfMonths = 1;
  if (smUp) {
    numberOfMonths = 2;
  }

  return (
    <Calendar
      mode="range"
      autoFocus
      numberOfMonths={numberOfMonths}
      selected={range}
      onSelect={handleSelect}
      disabled={{ after: todayDate }}
      defaultMonth={initialFrom ?? todayDate}
    />
  );
}
