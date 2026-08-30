import { Link } from 'react-router-dom';

import type { Patient } from '@/features/patients/types/patient.types';

interface PatientIdentityCellProps {
  readonly patient: Patient;
}

/**
 * The row's identity anchor: initials block + patient name (the ONLY link in
 * the row). The name is what staff scan for, so it is the heaviest element;
 * the ZRN now lives in its own dedicated column.
 */
export function PatientIdentityCell({ patient }: PatientIdentityCellProps) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        aria-hidden="true"
        className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-muted text-[11px] font-medium text-foreground"
      >
        {patient.initials}
      </span>
      <Link
        to={`/patients/${patient.id}`}
        className="min-w-0 truncate rounded-sm font-medium text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        title={patient.fullName}
      >
        {patient.fullName || 'Unnamed patient'}
      </Link>
    </div>
  );
}
