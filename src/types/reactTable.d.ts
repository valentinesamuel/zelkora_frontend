// Global module augmentation for @tanstack/react-table (v8). Picked up
// automatically by tsconfig.app.json's `include: ["src"]`. Lets column defs
// carry width/alignment classes and a sort key, and lets header renderers read
// the current URL sort state + the toggle callback off `table.options.meta`.
//
// There is exactly ONE such augmentation for the whole app (INV-B16): a second
// `declare module '@tanstack/react-table'` would merge, not shadow. So every
// field here is:
//   - OPTIONAL — a table with no sortable headers (or no meta at all) must not
//     be forced to fake them. This also removes the `table.options.meta!`
//     non-null-assertion hazard at the call sites.
//   - free of entity-specific literal unions — `sortKey?: string`, not
//     `'name' | 'age'`. Per-entity narrowing happens at the call site
//     (`patientColumns.tsx` annotates `sortKey: 'name'` locally), never in this
//     global declaration.

import type { RowData } from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    sortField?: string;
    sortDir?: 'asc' | 'desc';
    onToggleSort?: (field: string) => void;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    headerClassName?: string;
    cellClassName?: string;
    sortKey?: string;
  }
}
