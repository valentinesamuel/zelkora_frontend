import type { Control, FieldPath, FieldValues } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  options: readonly SelectOption[];
  placeholder: string;
  required?: boolean;
  className?: string;
}

/**
 * When a record loads with a value the option list doesn't contain (e.g. a
 * free-text value entered before this became a dropdown), surface it as an
 * extra item so the field renders the real value rather than an empty
 * placeholder — and doesn't silently blank it on save.
 */
function withCurrentValue(
  options: readonly SelectOption[],
  value: unknown,
): readonly SelectOption[] {
  if (typeof value !== 'string' || value === '') return options;
  if (options.some((o) => o.value === value)) return options;
  return [...options, { value, label: value }];
}

/** RHF-bound Radix select row. Entity-agnostic (takes `control` + `name`). */
export function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder,
  required = false,
  className,
}: SelectFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const resolvedOptions = withCurrentValue(options, field.value);
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
            <Select
              value={field.value || undefined}
              onValueChange={field.onChange}
            >
              <FormControl>
                <SelectTrigger className="w-full" onBlur={field.onBlur}>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {resolvedOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
