import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/apiClient';

interface StaffLoadErrorProps {
  notFound: boolean;
  error: unknown;
  onRetry: () => void;
}

function loadErrorDetail(notFound: boolean, error: unknown): string {
  if (notFound) return 'It may have been removed, or the link is incorrect.';
  if (error instanceof ApiError) return error.apiMessage;
  return 'Please try again.';
}

function loadErrorHeading(notFound: boolean): string {
  if (notFound) return 'Staff member not found.';
  return 'Could not load this staff member.';
}

export function StaffLoadError({
  notFound,
  error,
  onRetry,
}: Readonly<StaffLoadErrorProps>) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-xl bg-card p-6 text-sm ring-1 ring-foreground/10">
      <p className="font-medium">{loadErrorHeading(notFound)}</p>
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
          <Link to="/staff">Back to staff</Link>
        </Button>
      </div>
    </div>
  );
}
