import { useMemo, useRef, useState } from 'react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
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

interface ComboboxOption {
  value: string;
  label: string;
}

interface PatientComboboxFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  options: readonly ComboboxOption[];
  placeholder: string;
  required?: boolean;
  className?: string;
}

/**
 * RHF-bound searchable single-select. Same prop shape as `PatientSelectField`,
 * so it drops into `PatientFormSection` unchanged, but backed by a filterable
 * list instead of a native-style `<Select>` — used for long option sets
 * (nationality, ~190 entries) where `cmdk` is not a dependency.
 *
 * An `field.value` that is non-empty but absent from `options` still renders as
 * the current selection, so off-list values loaded from an existing record
 * survive an edit that doesn't touch this field.
 */
export function PatientComboboxField<T extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder,
  required = false,
  className,
}: PatientComboboxFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q === '') return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selectedLabel =
          options.find((o) => o.value === field.value)?.label ??
          (field.value ? String(field.value) : '');

        function commit(value: string) {
          field.onChange(value);
          setOpen(false);
          setSearch('');
          setActiveIndex(0);
        }

        function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
          } else if (event.key === 'Enter') {
            event.preventDefault();
            const choice = filtered[activeIndex];
            if (choice) commit(choice.value);
          }
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
                    aria-expanded={open}
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
                <div
                  ref={listRef}
                  role="listbox"
                  className="max-h-60 overflow-y-auto p-1"
                >
                  {filtered.length === 0 ? (
                    <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                      No match.
                    </p>
                  ) : (
                    filtered.map((option, index) => {
                      const isSelected = option.value === field.value;
                      const isActive = index === activeIndex;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => commit(option.value)}
                          className={cn(
                            'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-hidden',
                            isActive && 'bg-accent text-accent-foreground',
                          )}
                        >
                          <Check
                            className={cn(
                              'size-4 shrink-0',
                              isSelected ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                          {option.label}
                        </button>
                      );
                    })
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
