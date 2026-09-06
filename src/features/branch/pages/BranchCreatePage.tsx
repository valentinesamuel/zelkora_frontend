import { BranchForm } from '@/features/branch/components/BranchForm';

export function BranchCreatePage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Create branch
        </h1>
        <p className="text-sm text-muted-foreground">
          Add a new branch to your organisation.
        </p>
      </header>
      <BranchForm mode="create" />
    </div>
  );
}
