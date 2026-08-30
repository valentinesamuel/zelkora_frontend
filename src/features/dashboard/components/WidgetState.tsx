import type { ReactNode } from 'react';

import { EmptyState } from '@/features/dashboard/components/EmptyState';
import { ErrorBanner } from '@/features/dashboard/components/ErrorBanner';

interface WidgetStateProps<T> {
  readonly data: T | undefined;
  readonly isPending: boolean;
  readonly isError: boolean;
  readonly onRetry: () => void;
  readonly skeleton: ReactNode;
  readonly errorMessage: string;
  readonly isEmpty?: (data: T) => boolean;
  readonly emptyMessage?: string;
  readonly children: (data: T) => ReactNode;
}

// The pending / error / empty / data ladder every widget body shares.
export function WidgetState<T>({
  data,
  isPending,
  isError,
  onRetry,
  skeleton,
  errorMessage,
  isEmpty,
  emptyMessage,
  children,
}: WidgetStateProps<T>) {
  if (isPending) return <>{skeleton}</>;
  if (isError || data === undefined) {
    return <ErrorBanner message={errorMessage} onRetry={onRetry} />;
  }
  if (isEmpty?.(data)) {
    return <EmptyState message={emptyMessage ?? 'Nothing to show.'} />;
  }
  return <>{children(data)}</>;
}
