import { SkeletonRow } from '@/features/dashboard/components/SkeletonRow';

interface SkeletonListProps {
  readonly rows: number;
}

export function SkeletonList({ rows }: SkeletonListProps) {
  return (
    <div className="flex flex-col gap-1">
      {Array.from({ length: rows }, (_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}
