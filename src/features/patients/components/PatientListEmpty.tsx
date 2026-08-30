import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { SearchX, UserPlus, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface PatientListEmptyProps {
  readonly variant: 'no-data' | 'no-results';
  readonly onClearFilters: () => void;
}

export function PatientListEmpty({
  variant,
  onClearFilters,
}: PatientListEmptyProps) {
  const isNoData = variant === 'no-data';

  let Icon = SearchX;
  let heading = 'No patients found';
  let detail = 'Try adjusting your search or filters.';
  let action: ReactNode = (
    <Button variant="outline" onClick={onClearFilters}>
      Clear filters
    </Button>
  );
  if (isNoData) {
    Icon = Users;
    heading = 'No patients registered';
    detail = 'Register your first patient to see them listed here.';
    action = (
      <Button asChild>
        <Link to="/patients/new">
          <UserPlus aria-hidden="true" />
          Register patient
        </Link>
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
      <span className="flex size-10 items-center justify-center rounded-sm bg-muted text-muted-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{heading}</p>
        <p className="text-sm text-muted-foreground">{detail}</p>
      </div>
      {action}
    </div>
  );
}
