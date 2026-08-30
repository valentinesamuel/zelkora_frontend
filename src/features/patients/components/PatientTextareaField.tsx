import type { Control, FieldPath, FieldValues } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface PatientTextareaFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

/** RHF-bound multi-line input row for the patient form. */
export function PatientTextareaField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required = false,
  className,
}: PatientTextareaFieldProps<T>) {
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
            <Textarea rows={2} placeholder={placeholder} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
