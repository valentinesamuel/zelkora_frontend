import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/apiClient';

interface PatientLoadErrorProps {
  /** A 404 from the detail/edit fetch — the record itself is missing. */
  notFound: boolean;
  error: unknown;
  onRetry: () => void;
}

function loadErrorDetail(notFound: boolean, error: unknown): string {
  if (notFound) return 'It may have been removed, or the link is incorrect.';
  if (error instanceof ApiError) return error.apiMessage;
  return 'Please try again.';
}

/**
 * Shared "couldn't load this patient" panel for the detail and edit pages.
 * A 404 hides the Retry button (retrying a missing record is pointless); any
 * other failure keeps it.
 */
export function PatientLoadError({
  notFound,
  error,
  onRetry,
}: PatientLoadErrorProps) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-xl bg-card p-6 text-sm ring-1 ring-foreground/10">
      <p className="font-medium">
        {notFound ? 'Patient not found.' : 'Could not load this patient.'}
      </p>
      <p className="text-muted-foreground">
        {loadErrorDetail(notFound, error)}
      </p>
      <div className="flex gap-3">
        {!notFound && (
          <Button type="button" onClick={onRetry}>
            Retry
          </Button>
        )}
        <Button type="button" variant="outline" asChild>
          <Link to="/patients">Back to patients</Link>
        </Button>
      </div>
    </div>
  );
}
