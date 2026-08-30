// Module augmentation for @tanstack/react-table (v8). Picked up automatically by
// tsconfig.app.json's `include: ["src"]`. Lets column defs carry width/alignment
// classes and a sort key, and lets header renderers read the current URL sort
// state + the toggle callback off `table.options.meta`.

import type { RowData } from '@tanstack/react-table';

import type { SortDir } from '@/features/patients/types/patientListQuery.types';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    sortField: string;
    sortDir: SortDir;
    onToggleSort: (field: 'name' | 'age') => void;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    headerClassName?: string;
    cellClassName?: string;
    sortKey?: 'name' | 'age';
  }
}
