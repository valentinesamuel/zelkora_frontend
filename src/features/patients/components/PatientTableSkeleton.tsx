import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PatientTableSkeletonProps {
  readonly rows: number;
}

/** Mirrors `PatientTable`'s 8 columns so the layout does not shift when data lands. */
export function PatientTableSkeleton({ rows }: PatientTableSkeletonProps) {
  return (
    <div
      className="overflow-hidden rounded-lg border"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading patients…</span>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="min-w-56">Patient</TableHead>
            <TableHead className="w-40">ZRN</TableHead>
            <TableHead className="w-20 text-right">Age</TableHead>
            <TableHead className="w-20">Sex</TableHead>
            <TableHead className="w-36">Phone</TableHead>
            <TableHead className="w-28">Last visit</TableHead>
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
                <div className="flex items-center gap-3">
                  <Skeleton className="size-8 shrink-0 rounded-sm" />
                  <Skeleton className="h-3.5 w-40" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-3.5 w-24" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-3.5 w-8" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-3.5 w-12" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-3.5 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-3.5 w-16" />
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
