import { Link } from 'react-router-dom';

import {
  patientFullName,
  patientInitialsOf,
} from '@/features/patients/patientView';
import type { Patient } from '@/features/patients/types/patient.types';

interface PatientIdentityCellProps {
  readonly patient: Patient;
}

export function PatientIdentityCell({ patient }: PatientIdentityCellProps) {
  const fullName = patientFullName(patient);
  const initials = patientInitialsOf(patient);

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        aria-hidden="true"
        className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-muted text-[11px] font-medium text-foreground"
      >
        {initials}
      </span>
      <Link
        to={`/patients/${patient.id}`}
        className="min-w-0 truncate rounded-sm font-medium text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        title={fullName}
      >
        {fullName || 'Unnamed patient'}
      </Link>
    </div>
  );
}
