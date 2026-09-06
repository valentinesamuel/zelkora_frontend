import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface BranchTableSkeletonProps {
  readonly rows: number;
}

/** Mirrors `BranchTable`'s 7 columns so the layout does not shift when data lands. */
export function BranchTableSkeleton({ rows }: BranchTableSkeletonProps) {
  return (
    <div
      className="overflow-hidden rounded-lg border"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading branches…</span>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="min-w-56">Name</TableHead>
            <TableHead className="w-28">Code</TableHead>
            <TableHead className="w-40">Phone</TableHead>
            <TableHead className="min-w-48">Email</TableHead>
            <TableHead className="min-w-48">Address</TableHead>
            <TableHead className="w-28">Status</TableHead>
            <TableHead className="w-11">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }, (_, i) => (
            <TableRow key={i} className="hover:bg-transparent">
              <TableCell>
                <Skeleton className="h-3.5 w-40" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-3.5 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-3.5 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-3.5 w-36" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-3.5 w-44" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16 rounded-sm" />
              </TableCell>
              <TableCell>
                <Skeleton className="size-8 rounded-sm" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
