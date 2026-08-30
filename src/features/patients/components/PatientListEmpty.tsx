import { Link } from 'react-router-dom';
import { SearchX, UserPlus, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface PatientListEmptyProps {
  readonly variant: 'no-data' | 'no-results';
  readonly onClearFilters: () => void;
}

/**
 * Two genuinely different situations, two different messages:
 *  - `no-data`     — the hospital has no registered patients yet.
 *  - `no-results`  — patients exist, but none match the search / filters.
 */
export function PatientListEmpty({
  variant,
  onClearFilters,
}: PatientListEmptyProps) {
  const isNoData = variant === 'no-data';
  const Icon = isNoData ? Users : SearchX;

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
      <span className="flex size-10 items-center justify-center rounded-sm bg-muted text-muted-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">
          {isNoData ? 'No patients registered' : 'No patients found'}
        </p>
        <p className="text-sm text-muted-foreground">
          {isNoData
            ? 'Register your first patient to see them listed here.'
            : 'Try adjusting your search or filters.'}
        </p>
      </div>
      {isNoData ? (
        <Button asChild>
          <Link to="/patients/new">
            <UserPlus aria-hidden="true" />
            Register patient
          </Link>
        </Button>
      ) : (
        <Button variant="outline" onClick={onClearFilters}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
