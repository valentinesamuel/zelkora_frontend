import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import type { TableMeta } from '@tanstack/react-table';

import { cn } from '@/lib/utils';
import type { BranchListRow } from '@/features/branch/components/branchColumns';

type SortDir = 'asc' | 'desc';

const HEADER_BUTTON =
  '-mx-1 inline-flex items-center gap-1 rounded-sm px-1 py-0.5 text-xs font-medium tracking-wide text-muted-foreground uppercase transition-colors motion-reduce:transition-none hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

interface BranchSortableHeaderProps {
  readonly label: string;
  readonly sortKey: 'name' | 'code';
  readonly align?: 'start' | 'end';
  // Optional — `TableMeta` fields are optional in the shared augmentation
  // (INV-B16); `table.options.meta` is passed through without a `!`.
  readonly meta: TableMeta<BranchListRow> | undefined;
}

function SortIcon({
  active,
  dir,
}: Readonly<{ active: boolean; dir: SortDir }>) {
  if (!active) {
    return (
      <ChevronsUpDown
        aria-hidden="true"
        className="size-3.5 text-muted-foreground/60"
      />
    );
  }
  if (dir === 'asc') {
    return <ArrowUp aria-hidden="true" className="size-3.5" />;
  }
  return <ArrowDown aria-hidden="true" className="size-3.5" />;
}

export function BranchSortableHeader({
  label,
  sortKey,
  align,
  meta,
}: BranchSortableHeaderProps) {
  const active = meta?.sortField === sortKey;
  const dir: SortDir = meta?.sortDir ?? 'desc';

  let currentOrder = 'descending';
  if (dir === 'asc') {
    currentOrder = 'ascending';
  }

  let ariaLabel = `Sort by ${label.toLowerCase()}`;
  if (active) {
    ariaLabel = `Sort by ${label.toLowerCase()}, currently ${currentOrder}`;
  }

  return (
    <button
      type="button"
      onClick={() => meta?.onToggleSort?.(sortKey)}
      aria-label={ariaLabel}
      className={cn(HEADER_BUTTON, align === 'end' && 'flex-row-reverse')}
    >
      {label}
      <SortIcon active={active} dir={dir} />
    </button>
  );
}
