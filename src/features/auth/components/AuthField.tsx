import type { ReactNode } from 'react';

import { FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface AuthFieldProps {
  label: string;
  children: ReactNode;
}

/**
 * "Notched outline" field chrome: the label sits on the input's top border,
 * with a background chip behind it so the border doesn't strike through the
 * text. `children` must already be the `FormControl`-wrapped input — this
 * component only owns the label/message chrome, not the control itself.
 */
export function AuthField({ label, children }: Readonly<AuthFieldProps>) {
  return (
    <FormItem className="relative gap-0">
      <FormLabel className="absolute -top-2 left-3 z-10 bg-background px-1 text-xs font-normal text-muted-foreground">
        {label}
      </FormLabel>
      {children}
      <FormMessage className="mt-1.5" />
    </FormItem>
  );
}
