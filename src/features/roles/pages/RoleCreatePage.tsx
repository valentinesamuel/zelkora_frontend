import { RoleForm } from '@/features/roles/components/RoleForm';

export function RoleCreatePage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="text-base font-semibold">Create role</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a new role and choose the permissions it grants.
        </p>
      </header>
      <RoleForm mode="create" />
    </div>
  );
}
