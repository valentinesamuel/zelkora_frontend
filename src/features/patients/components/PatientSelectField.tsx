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

interface PatientSelectFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  options: readonly SelectOption[];
  placeholder: string;
  required?: boolean;
  className?: string;
}

/** RHF-bound Radix select row for the patient form. */
export function PatientSelectField<T extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder,
  required = false,
  className,
}: PatientSelectFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
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
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
