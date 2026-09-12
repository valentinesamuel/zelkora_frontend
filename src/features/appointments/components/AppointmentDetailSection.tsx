import type { ReactNode } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AppointmentDetailSectionProps {
  title: string;
  /** Optional actions rendered on the right of the header (e.g. an edit link). */
  action?: ReactNode;
  children: ReactNode;
}

/**
 * A titled card on the appointment detail page. Replicates
 * `features/patients/components/PatientDetailSection.tsx` rather than
 * importing it: that component is structurally generic but lives in — and is
 * named for — the patients feature, and cross-feature component imports are
 * not a pattern this codebase uses. Promoting it to `components/` would mean
 * editing the patients feature, which is out of scope here.
 */
export function AppointmentDetailSection({
  title,
  action,
  children,
}: Readonly<AppointmentDetailSectionProps>) {
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
