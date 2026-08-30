import type { ReactNode } from 'react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface PatientDetailSectionProps {
  title: string;
  /** Optional actions rendered on the right of the header (e.g. an edit link). */
  action?: ReactNode;
  children: ReactNode;
}

/**
 * A titled card on the patient detail page. `children` is normally a
 * `<dl>` of `PatientDetailField`s, but any content is allowed so future
 * sections (timelines, tables) can reuse the same shell.
 */
export function PatientDetailSection({
  title,
  action,
  children,
}: Readonly<PatientDetailSectionProps>) {
  return (
    <Card className="[--card-spacing:--spacing(5)]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
