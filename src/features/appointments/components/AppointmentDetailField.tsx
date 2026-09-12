import type { ReactNode } from 'react';

interface AppointmentDetailFieldProps {
  label: string;
  value?: ReactNode;
  className?: string;
}

/** `<dt>`/`<dd>` pair — the appointment twin of `PatientDetailField`. */
export function AppointmentDetailField({
  label,
  value,
  className,
}: Readonly<AppointmentDetailFieldProps>) {
  const isEmpty = value == null || value === '' || value === '—';

  let content: ReactNode = value;
  if (isEmpty) {
    content = <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className={className}>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm text-foreground">{content}</dd>
    </div>
  );
}
