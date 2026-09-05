import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { isOffsetResult } from '@/lib/query';
import { useBranches } from '@/features/branch/api/branches.api';
import { BranchListEmpty } from '@/features/branch/components/BranchListEmpty';
import { BranchListError } from '@/features/branch/components/BranchListError';
import { BranchListHeader } from '@/features/branch/components/BranchListHeader';
import { BranchTable } from '@/features/branch/components/BranchTable';
import { BranchTableSkeleton } from '@/features/branch/components/BranchTableSkeleton';
import {
  LIMIT_OPTIONS,
  hasActiveQuery,
  type BranchStatusFilter,
} from '@/features/branch/filters/branchListParams';
import { toBranchQuery } from '@/features/branch/filters/toBranchQuery';
import { useBranchListParams } from '@/features/branch/filters/useBranchListParams';

const SEARCH_DEBOUNCE_MS = 300;
const countFormatter = new Intl.NumberFormat('en-NG');

export function BranchListPage() {
  const {
    query,
    setSearch,
    setStatus,
    toggleSort,
    setPageSize,
    setPage,
    clearFilters,
  } = useBranchListParams();

  // Debounced local draft for the search box. Re-syncs when the committed
  // value changes elsewhere (Clear filters, back/forward) via the
  // "adjust state while rendering" pattern, not an effect.
  const [draft, setDraft] = useState(query.search);
  const [lastSearch, setLastSearch] = useState(query.search);
  if (query.search !== lastSearch) {
    setLastSearch(query.search);
    setDraft(query.search);
  }
  useEffect(() => {
    if (draft === query.search) return undefined;
    const id = window.setTimeout(() => setSearch(draft), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [draft, query.search, setSearch]);

  const branchesQuery = useMemo(() => toBranchQuery(query), [query]);
  const { data, isPending, isError, isFetching, refetch } =
    useBranches(branchesQuery);

  const filtersOrSearchActive = hasActiveQuery(query);

  let results: ReactNode;
  if (isPending) {
    results = <BranchTableSkeleton rows={query.pageSize} />;
  } else if (isError) {
    results = <BranchListError onRetry={() => void refetch()} />;
  } else {
    const rows = [...data.data];

    let total = rows.length;
    if (isOffsetResult(data)) {
      total = data.total;
    }

    if (rows.length === 0) {
      let emptyVariant: 'no-results' | 'no-data' = 'no-data';
      if (filtersOrSearchActive) {
        emptyVariant = 'no-results';
      }
      results = (
        <BranchListEmpty
          variant={emptyVariant}
          onClearFilters={clearFilters}
        />
      );
    } else {
      // Dim only on a background refetch (filter change, page change) — the
      // previous page stays visible under `keepPreviousData` while the next
      // one loads.
      const rangeStart = (query.page - 1) * query.pageSize + 1;
      const rangeEnd = rangeStart + rows.length - 1;
      const hasPrev = query.page > 1;
      const hasNext = query.page * query.pageSize < total;

      results = (
        <div className="flex flex-col gap-4">
          <div
            className={cn(
              'transition-opacity motion-reduce:transition-none',
              isFetching && 'pointer-events-none opacity-60',
            )}
            aria-busy={isFetching}
          >
            <BranchTable
              branches={rows}
              sort={query}
              onToggleSort={toggleSort}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Showing {countFormatter.format(rangeStart)}&ndash;
              {countFormatter.format(rangeEnd)} of{' '}
              {countFormatter.format(total)} branches
            </p>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Per page</span>
                <Select
                  value={String(query.pageSize)}
                  onValueChange={(value) => setPageSize(Number(value))}
                >
                  <SelectTrigger
                    size="sm"
                    aria-label="Branches per page"
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

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(query.page - 1)}
                  disabled={!hasPrev}
                  aria-label="Previous page"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage(query.page + 1)}
                  disabled={!hasNext}
                  aria-label="Next page"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-6 p-6">
      <BranchListHeader />

      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="search" className="relative w-full sm:max-w-sm">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            aria-label="Search branches by name or code"
            placeholder="Search by name or code..."
            className="pl-8"
          />
        </div>

        <Select
          value={query.status}
          onValueChange={(value) => setStatus(value as BranchStatusFilter)}
        >
          <SelectTrigger
            size="sm"
            aria-label="Filter branches by status"
            className="w-40"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {results}
    </div>
  );
}
