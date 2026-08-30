import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LIMIT_OPTIONS } from '@/features/patients/filters/patientListParams';
import type { PatientPageInfo } from '@/features/patients/types/patientListQuery.types';

const countFormatter = new Intl.NumberFormat('en-NG');

interface PatientListPaginationProps {
  readonly pageCount: number;
  readonly total: number | null;
  readonly limit: number;
  readonly pageInfo: PatientPageInfo;
  readonly onLimitChange: (limit: number) => void;
  readonly onPrev: () => void;
  readonly onNext: () => void;
}

export function PatientListPagination({
  pageCount,
  total,
  limit,
  pageInfo,
  onLimitChange,
  onPrev,
  onNext,
}: PatientListPaginationProps) {
  let summary = `Showing ${countFormatter.format(pageCount)} patients`;
  if (total !== null) {
    summary = `Showing ${countFormatter.format(pageCount)} of ${countFormatter.format(total)} patients`;
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

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            onClick={onPrev}
            disabled={!pageInfo.hasPrev}
            aria-label="Previous page"
          >
            <ChevronLeft aria-hidden="true" />
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={onNext}
            disabled={!pageInfo.hasNext}
            aria-label="Next page"
          >
            Next
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
