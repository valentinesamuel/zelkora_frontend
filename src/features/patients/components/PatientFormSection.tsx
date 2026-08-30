import type { ReactNode } from 'react';

interface PatientFormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/** A titled block of related fields inside the patient form card. */
export function PatientFormSection({
  title,
  description,
  children,
}: Readonly<PatientFormSectionProps>) {
  return (
    <section className="grid gap-4 border-t pt-6 first:border-t-0 first:pt-0">
      <div className="grid gap-0.5">
        <h2 className="text-sm font-medium">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}
