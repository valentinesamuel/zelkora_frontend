import { useState } from 'react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { CalendarIcon } from 'lucide-react';

import { Calendar } from '@/components/ui/calendar';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateTimeRangeFieldProps<T extends FieldValues> {
  control: Control<T>;
  startName: FieldPath<T>;
  endName: FieldPath<T>;
  label: string;
  required?: boolean;
  className?: string;
}

// Combines a calendar-picked date with a `HH:mm` time-of-day string into an
// ISO datetime string, in the browser's local timezone. Exported for the unit
// test — this is the one place date + time composition happens.
// eslint-disable-next-line react-refresh/only-export-components -- test-only helper export, not a component
export function composeDateTimeIso(date: Date, time: string): string {
  const [hoursRaw, minutesRaw] = time.split(':');
  const hours = Number(hoursRaw ?? 0);
  const minutes = Number(minutesRaw ?? 0);
  const composed = new Date(date);
  composed.setHours(hours, minutes, 0, 0);
  return composed.toISOString();
}

function toDateInputParts(isoValue: string): {
  date: Date | undefined;
  time: string;
} {
  if (!isoValue) {
    return { date: undefined, time: '' };
  }
  const parsed = new Date(isoValue);
  if (Number.isNaN(parsed.getTime())) {
    return { date: undefined, time: '' };
  }
  const hours = String(parsed.getHours()).padStart(2, '0');
  const minutes = String(parsed.getMinutes()).padStart(2, '0');
  return { date: parsed, time: `${hours}:${minutes}` };
}

// Date + start-time + end-time picker for a pair of RHF-controlled ISO
// datetime string fields. The end>start ordering rule is NOT enforced here —
// it is owned by the consuming zod schema's `.refine()`, and its error
// surfaces through the `endName` `<FormMessage />` below.
export function DateTimeRangeField<T extends FieldValues>({
  control,
  startName,
  endName,
  label,
  required = false,
  className,
}: Readonly<DateTimeRangeFieldProps<T>>) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn(className)}>
      <FormField
        control={control}
        name={startName}
        render={({ field: startField }) => (
          <FormField
            control={control}
            name={endName}
            render={({ field: endField }) => {
              let startIso = '';
              if (typeof startField.value === 'string') {
                startIso = startField.value;
              }
              let endIso = '';
              if (typeof endField.value === 'string') {
                endIso = endField.value;
              }
              const { date: selectedDate, time: startTime } =
                toDateInputParts(startIso);
              const { time: endTime } = toDateInputParts(endIso);

              function applyDate(nextDate: Date) {
                startField.onChange(
                  composeDateTimeIso(nextDate, startTime || '00:00'),
                );
                endField.onChange(
                  composeDateTimeIso(nextDate, endTime || '00:00'),
                );
                setOpen(false);
              }

              function applyStartTime(nextTime: string) {
                const baseDate = selectedDate ?? new Date();
                startField.onChange(composeDateTimeIso(baseDate, nextTime));
              }

              function applyEndTime(nextTime: string) {
                const baseDate = selectedDate ?? new Date();
                endField.onChange(composeDateTimeIso(baseDate, nextTime));
              }

              let dateLabel = 'Pick a date';
              if (selectedDate) {
                dateLabel = selectedDate.toLocaleDateString();
              }

              return (
                <FormItem>
                  <FormLabel>
                    {label}
                    {required && (
                      <span aria-hidden="true" className="text-destructive">
                        *
                      </span>
                    )}
                  </FormLabel>
                  <Popover open={open} onOpenChange={setOpen}>
                    <FormControl>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            'flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
                            !selectedDate && 'text-muted-foreground',
                          )}
                        >
                          <span className="line-clamp-1 text-left">
                            {dateLabel}
                          </span>
                          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
                        </button>
                      </PopoverTrigger>
                    </FormControl>
                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(nextDate) => {
                          if (nextDate) applyDate(nextDate);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <div className="flex gap-2">
                    <Input
                      type="time"
                      aria-label={`${label} start time`}
                      value={startTime}
                      onChange={(event) =>
                        applyStartTime(event.target.value)
                      }
                      onBlur={startField.onBlur}
                    />
                    <Input
                      type="time"
                      aria-label={`${label} end time`}
                      value={endTime}
                      onChange={(event) => applyEndTime(event.target.value)}
                      onBlur={endField.onBlur}
                    />
                  </div>
                </FormItem>
              );
            }}
          />
        )}
      />
      {/* Rendered outside the shared FormItem above so each carries its own
          name's fieldState — the schema's end>start `.refine()` attaches its
          error to `endAt`, and it surfaces via the second of these. */}
      <FormField
        control={control}
        name={startName}
        render={() => (
          <FormItem className="mt-1">
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={endName}
        render={() => (
          <FormItem className="mt-1">
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
