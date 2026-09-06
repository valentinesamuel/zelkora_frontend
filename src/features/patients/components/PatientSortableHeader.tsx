import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import type { TableMeta } from '@tanstack/react-table';

import { cn } from '@/lib/utils';
import type { Patient } from '@/features/patients/types/patient.types';
import type { SortDir } from '@/features/patients/types/patientListQuery.types';

const HEADER_BUTTON =
  '-mx-1 inline-flex items-center gap-1 rounded-sm px-1 py-0.5 text-xs font-medium tracking-wide text-muted-foreground uppercase transition-colors motion-reduce:transition-none hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

interface PatientSortableHeaderProps {
  readonly label: string;
  readonly sortKey: 'name' | 'age';
  readonly align?: 'start' | 'end';
  // Optional: `TableMeta`'s fields are optional in the shared augmentation
  // (INV-B16), so `table.options.meta` is `TableMeta<Patient> | undefined` at
  // the call site — passed through without a non-null assertion.
  readonly meta: TableMeta<Patient> | undefined;
}

function SortIcon({ active, dir }: Readonly<{ active: boolean; dir: SortDir }>) {
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


export function PatientSortableHeader({
  label,
  sortKey,
  align,
  meta,
}: PatientSortableHeaderProps) {
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
