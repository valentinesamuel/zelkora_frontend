import type { LucideIcon } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface PatientDetailPlaceholderProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

/**
 * An empty section on the patient detail page — a labelled slot that a later
 * feature (appointments, encounters, billing …) fills in. Adding a new
 * expansion area is one entry in `PATIENT_DETAIL_PLACEHOLDERS`.
 */
export function PatientDetailPlaceholder({
  title,
  description,
  icon: Icon,
}: Readonly<PatientDetailPlaceholderProps>) {
  return (
    <Card className="[--card-spacing:--spacing(5)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-muted-foreground">
          {Icon && <Icon className="size-4" aria-hidden="true" />}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center rounded-lg border border-dashed py-8 text-sm text-muted-foreground">
          Nothing here yet.
        </div>
      </CardContent>
    </Card>
  );
}
