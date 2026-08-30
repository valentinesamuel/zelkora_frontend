import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Can } from '@/features/auth/Can';
import { RoleEnum } from '@/features/auth/types';

export function PatientListHeader() {

  return (
    <header className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Patients
        </h1>
        <p className="text-sm text-muted-foreground">
          View and manage registered patients.
        </p>
      </div>
      <Can role={[RoleEnum.ADMIN, RoleEnum.NURSE, RoleEnum.RECEPTIONIST]}>
        <Button asChild>
          <Link to="/patients/new">
            <UserPlus aria-hidden="true" />
            Register patient
          </Link>
        </Button>
      </Can>
    </header>
  );
}
