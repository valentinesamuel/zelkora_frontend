import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LIMIT_OPTIONS } from '@/features/patients/filters/patientListParams';

const countFormatter = new Intl.NumberFormat('en-NG');

interface PatientListPaginationProps {
  readonly loadedCount: number;
  readonly total: number | null;
  readonly limit: number;
  readonly hasNextPage: boolean;
  readonly isFetchingNextPage: boolean;
  readonly onLoadMore: () => void;
  readonly onLimitChange: (limit: number) => void;
}

export function PatientListPagination({
  loadedCount,
  total,
  limit,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onLimitChange,
}: PatientListPaginationProps) {
  let summary = `Showing ${countFormatter.format(loadedCount)} patients`;
  if (total !== null) {
    summary = `Showing ${countFormatter.format(loadedCount)} of ${countFormatter.format(total)} patients`;
  }

  let loadMoreLabel = 'Load more';
  if (isFetchingNextPage) {
    loadMoreLabel = 'Loading…';
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {summary}
      </p>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Per page</span>
          <Select
            value={String(limit)}
            onValueChange={(value) => onLimitChange(Number(value))}
          >
            <SelectTrigger
              size="sm"
              aria-label="Patients per page"
              className="w-16"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LIMIT_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasNextPage && (
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
            aria-label="Load more patients"
          >
            {loadMoreLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
