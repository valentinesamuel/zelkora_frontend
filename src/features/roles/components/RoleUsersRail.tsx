import type { ReactNode } from 'react';
import { Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { userStatusBadgeVariant, userStatusLabel } from '@/lib/userStatus';

import type { RoleUser } from '@/features/roles/roles.types';

interface RoleUsersRailProps {
  readonly users: readonly RoleUser[];
}

// Right rail on the role edit page — its own scrollable list (`max-h` +
// `overflow-y-auto`) so a role with many members doesn't stretch the whole
// page; the form column scrolls independently. Mirrors the sticky right-rail
// card pattern from `PatientDetailPage`'s "Quick facts".
export function RoleUsersRail({ users }: RoleUsersRailProps) {
  let content: ReactNode;
  if (users.length === 0) {
    content = (
      <p className="text-sm text-muted-foreground">
        No staff currently hold this role.
      </p>
    );
  } else {
    content = (
      <ul className="flex max-h-96 flex-col divide-y divide-border overflow-y-auto rounded-lg border">
        {users.map((user) => (
          <li
            key={user.id}
            className="flex items-center justify-between gap-3 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.fullName}</p>
              <p className="truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            </div>
            <Badge variant={userStatusBadgeVariant(user.status)}>
              {userStatusLabel(user.status)}
            </Badge>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Card className="[--card-spacing:--spacing(5)] h-fit lg:sticky lg:top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="size-4 text-muted-foreground" aria-hidden="true" />
          Staff with this role
        </CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
