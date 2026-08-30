import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import type { TableMeta } from '@tanstack/react-table';

import { cn } from '@/lib/utils';
import type { Patient } from '@/features/patients/types/patient.types';
import type { SortDir } from '@/features/patients/types/patientListQuery.types';

// Byte-identical to the previous inline sortable-header button
// (PatientTable.tsx:80). Do not retype — copied verbatim.
const HEADER_BUTTON =
  '-mx-1 inline-flex items-center gap-1 rounded-sm px-1 py-0.5 text-xs font-medium tracking-wide text-muted-foreground uppercase transition-colors motion-reduce:transition-none hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

interface PatientSortableHeaderProps {
  readonly label: string;
  readonly sortKey: 'name' | 'age';
  readonly align?: 'start' | 'end';
  readonly meta: TableMeta<Patient>;
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
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

/**
 * The in-`<th>` sort toggle button. Visually identical to a plain header apart
 * from the trailing sort icon. `aria-sort` is deliberately NOT set here — it
 * belongs on the `<th>` (see PatientTable). `align="end"` reverses the flex row
 * so the icon sits left of the label in a right-aligned numeric column.
 */
export function PatientSortableHeader({
  label,
  sortKey,
  align,
  meta,
}: PatientSortableHeaderProps) {
  const active = meta.sortField === sortKey;
  const dir = meta.sortDir;
  const currentOrder = dir === 'asc' ? 'ascending' : 'descending';
  const ariaLabel = active
    ? `Sort by ${label.toLowerCase()}, currently ${currentOrder}`
    : `Sort by ${label.toLowerCase()}`;

  return (
    <button
      type="button"
      onClick={() => meta.onToggleSort(sortKey)}
      aria-label={ariaLabel}
      className={cn(HEADER_BUTTON, align === 'end' && 'flex-row-reverse')}
    >
      {label}
      <SortIcon active={active} dir={dir} />
    </button>
  );
}
