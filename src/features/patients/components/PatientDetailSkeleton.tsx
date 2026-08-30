import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const SECTIONS = ['a', 'b', 'c'];
const FIELDS = ['a', 'b', 'c', 'd'];

/** Loading placeholder for the patient detail page. Mirrors the real layout. */
export function PatientDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Skeleton className="size-14 rounded-lg" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-6">
          {SECTIONS.map((s) => (
            <Card key={s} className="[--card-spacing:--spacing(5)]">
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {FIELDS.map((f) => (
                  <div key={f} className="grid gap-1.5">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="[--card-spacing:--spacing(5)] h-fit">
          <CardHeader>
            <Skeleton className="h-5 w-28" />
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {FIELDS.map((f) => (
              <div key={f} className="grid gap-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
