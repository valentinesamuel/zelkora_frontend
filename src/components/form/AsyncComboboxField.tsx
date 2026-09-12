import { useId, useRef, useState } from 'react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown } from 'lucide-react';

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
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export interface AsyncComboboxOption {
  value: string;
  label: string;
}

interface AsyncComboboxFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  searchFn: (
    query: string,
  ) => Promise<readonly AsyncComboboxOption[]>;
  debounceMs?: number;
  placeholder: string;
  required?: boolean;
  className?: string;
  // Seeds the displayed label for a preselected `value` whose label isn't in
  // the current (async, query-driven) result set — e.g. editing a record
  // whose current option never shows up unless the user happens to search
  // for it. Once the user commits a new choice, the label is derived from
  // that choice instead.
  initialLabel?: string;
}

// Generalized async-search combobox. Shares the Popover shell, ARIA wiring
// and keyboard-navigation behaviour of
// `features/patients/components/PatientComboboxField.tsx`, but resolves its
// options from a debounced server-side `searchFn` (via TanStack Query)
// instead of filtering a static in-memory array.
export function AsyncComboboxField<T extends FieldValues>({
  control,
  name,
  label,
  searchFn,
  debounceMs = 250,
  placeholder,
  required = false,
  className,
  initialLabel,
}: Readonly<AsyncComboboxFieldProps<T>>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedLabel, setSelectedLabel] = useState(initialLabel ?? '');
  const listboxId = useId();
  const listRef = useRef<HTMLUListElement | null>(null);

  const debounced = useDebouncedValue(search, debounceMs);

  const { data, isPending, isError } = useQuery({
    queryKey: [label, debounced],
    queryFn: () => searchFn(debounced),
  });

  const options = data ?? [];

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        function commit(value: string, optionLabel: string) {
          field.onChange(value);
          setSelectedLabel(optionLabel);
          setOpen(false);
          setSearch('');
          setActiveIndex(0);
        }

        function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, options.length - 1));
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
          } else if (event.key === 'Enter') {
            event.preventDefault();
            const choice = options[activeIndex];
            if (choice) commit(choice.value, choice.label);
          }
        }

        let list: React.ReactNode;
        if (isPending) {
          list = (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              Loading…
            </p>
          );
        } else if (isError) {
          list = (
            <p className="px-2 py-6 text-center text-sm text-destructive">
              Something went wrong. Try again.
            </p>
          );
        } else if (options.length === 0) {
          list = (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              No match.
            </p>
          );
        } else {
          list = options.map((option, index) => {
            const isSelected = option.value === field.value;
            const isActive = index === activeIndex;

            let checkOpacity = 'opacity-0';
            if (isSelected) {
              checkOpacity = 'opacity-100';
            }

            let tabIndex = -1;
            if (isActive) {
              tabIndex = 0;
            }

            return (
              <option
                key={option.value}
                value={option.value}
                aria-selected={isSelected}
                tabIndex={tabIndex}
                onFocus={() => setActiveIndex(index)}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => commit(option.value, option.label)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    commit(option.value, option.label);
                  }
                }}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isActive && 'bg-accent text-accent-foreground',
                )}
              >
                <Check className={cn('size-4 shrink-0', checkOpacity)} />
                {option.label}
              </option>
            );
          });
        }

        return (
          <FormItem className={cn(className)}>
            <FormLabel>
              {label}
              {required && (
                <span aria-hidden="true" className="text-destructive">
                  *
                </span>
              )}
            </FormLabel>
            <Popover
              open={open}
              onOpenChange={(next) => {
                setOpen(next);
                if (!next) {
                  setSearch('');
                  setActiveIndex(0);
                  field.onBlur();
                }
              }}
            >
              <FormControl>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    role="combobox"
                    aria-controls={listboxId}
                    aria-expanded={open}
                    aria-haspopup="listbox"
                    className={cn(
                      'flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
                      !selectedLabel && 'text-muted-foreground',
                    )}
                  >
                    <span className="line-clamp-1 text-left">
                      {selectedLabel || placeholder}
                    </span>
                    <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
                  </button>
                </PopoverTrigger>
              </FormControl>
              <PopoverContent
                align="start"
                className="w-(--radix-popover-trigger-width) p-0"
              >
                <div className="p-1.5">
                  <Input
                    autoFocus
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setActiveIndex(0);
                    }}
                    onKeyDown={onKeyDown}
                    placeholder={`Search ${label.toLowerCase()}…`}
                    className="h-8"
                  />
                </div>
                <ul
                  ref={listRef}
                  aria-label={`${label} options`}
                  className="max-h-60 overflow-y-auto p-1"
                >
                  {list}
                </ul>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
