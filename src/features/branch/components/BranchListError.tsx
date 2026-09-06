import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface BranchListErrorProps {
  readonly onRetry: () => void;
}

/**
 * Failure surface for the branch list load. Inline (not a toast) so it cannot
 * be missed, and generic — the raw `ApiError` message is never shown to staff.
 */
export function BranchListError({ onRetry }: BranchListErrorProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-6 py-16 text-center text-destructive-text"
    >
      <AlertTriangle className="size-5" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">Couldn't load branches</p>
        <p className="text-sm">
          Something went wrong while fetching the branch list. Please try again.
        </p>
      </div>
      <Button variant="outline" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
