import type { ReactNode } from 'react';

interface PatientDetailFieldProps {
  label: string;
  /** Pre-formatted display value. Falls back to an em-dash when empty. */
  value?: ReactNode;
  className?: string;
}

/** One label/value pair inside a detail section. */
export function PatientDetailField({
  label,
  value,
  className,
}: Readonly<PatientDetailFieldProps>) {
  const isEmpty =
    value == null || value === '' || value === '—';
  return (
    <div className={className}>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm text-foreground">
        {isEmpty ? <span className="text-muted-foreground">—</span> : value}
      </dd>
    </div>
  );
}
