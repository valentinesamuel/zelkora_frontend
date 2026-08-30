import type { Control, FieldPath, FieldValues } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PatientTextFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'date';
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  className?: string;
}

/** RHF-bound single-line input row for the patient form. */
export function PatientTextField<T extends FieldValues>({
  control,
  name,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  required = false,
  className,
}: PatientTextFieldProps<T>) {
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
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              autoComplete={autoComplete}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
