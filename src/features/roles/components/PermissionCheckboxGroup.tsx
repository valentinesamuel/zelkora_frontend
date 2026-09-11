import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { groupPermissions } from '@/features/roles/permissionGroups';
import type { Permission } from '@/features/roles/roles.types';

interface PermissionCheckboxGroupProps {
  readonly permissions: readonly Permission[];
  readonly value: readonly string[];
  readonly onChange: (next: string[]) => void;
  readonly disabled?: boolean;
}

// Renders `permissions` grouped by resource (via `groupPermissions`, which
// already filters out `*:*` — nothing here re-adds it). Each checkbox
// toggles one permission id in/out of `value`.
export function PermissionCheckboxGroup({
  permissions,
  value,
  onChange,
  disabled = false,
}: PermissionCheckboxGroupProps) {
  const groups = groupPermissions(permissions);
  const selected = new Set(value);

  function toggle(id: string, checked: boolean) {
    const next = new Set(selected);
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    onChange([...next]);
  }

  if (groups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No permissions are available.
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {groups.map((group) => (
        <div key={group.resource} className="flex flex-col gap-2">
          <p className="text-sm font-medium capitalize">{group.resource}</p>
          <div className="flex flex-col gap-2">
            {group.permissions.map((permission) => (
              <div key={permission.id} className="flex items-center gap-2">
                <Checkbox
                  id={`permission-${permission.id}`}
                  checked={selected.has(permission.id)}
                  disabled={disabled}
                  onCheckedChange={(checked) =>
                    toggle(permission.id, checked === true)
                  }
                />
                <Label
                  htmlFor={`permission-${permission.id}`}
                  className="font-mono text-xs font-normal text-muted-foreground"
                >
                  {permission.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
