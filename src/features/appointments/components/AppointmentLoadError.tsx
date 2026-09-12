import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { apiErrorMessage } from '@/lib/formErrors';

interface AppointmentLoadErrorProps {
  readonly notFound: boolean;
  readonly error: unknown;
  readonly onRetry: () => void;
}

/** Load failure for a single appointment (detail / edit). */
export function AppointmentLoadError({
  notFound,
  error,
  onRetry,
}: AppointmentLoadErrorProps) {
  if (notFound) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-lg border p-6">
        <p className="text-sm text-muted-foreground">
          This appointment no longer exists.
        </p>
        <Button variant="outline" asChild>
          <Link to="/appointments">Back to appointments</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border p-6">
      <p className="text-sm text-muted-foreground">
        {apiErrorMessage(error, 'Could not load this appointment.')}
      </p>
      <Button variant="outline" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
