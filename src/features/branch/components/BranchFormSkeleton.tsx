import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const ROWS = ['a', 'b', 'c', 'd'];

/** Loading placeholder shown while the edit form hydrates from GET /branches/:id. */
export function BranchFormSkeleton() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-6">
        <Skeleton className="h-5 w-40" />
        <div className="grid gap-4 sm:grid-cols-2">
          {ROWS.map((row) => (
            <div key={row} className="grid gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
