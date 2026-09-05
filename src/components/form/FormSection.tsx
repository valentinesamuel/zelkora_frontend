import type { ReactNode } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * A titled card of related fields. Each section is its own card (the shadcn
 * settings-form pattern) so a form scans as a stack of self-contained groups
 * rather than one long sheet. Entity-agnostic — shared by the patient and
 * branch forms.
 */
export function FormSection({
  title,
  description,
  children,
}: Readonly<FormSectionProps>) {
  return (
    <Card className="[--card-spacing:--spacing(6)]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {children}
      </CardContent>
    </Card>
  );
}
