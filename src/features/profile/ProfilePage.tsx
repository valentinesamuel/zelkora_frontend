import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useAuthStore } from '../auth/authStore';

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  if (user === null) {
    throw new Error('ProfilePage rendered without an authenticated user');
  }

  async function handleLogout() {
    setPending(true);
    await logout();
    navigate('/login', { replace: true });
  }

  let logoutLabel = 'Log out';
  if (pending) {
    logoutLabel = 'Logging out…';
  }

  return (
    <div className="p-6">
      <Card className="w-full max-w-sm [--card-spacing:--spacing(6)]">
        <CardHeader>
          <CardTitle>
            <h1 className="text-xl font-semibold">Profile</h1>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <dl className="mb-5 grid gap-3">
            <div>
              <dt className="mb-0.5 text-sm leading-none font-medium">Name</dt>
              <dd className="m-0 text-foreground">{user.fullName}</dd>
            </div>
            <div>
              <dt className="mb-0.5 text-sm leading-none font-medium">Role</dt>
              <dd className="m-0 text-foreground">{user.roleName}</dd>
            </div>
          </dl>

          <Button type="button" onClick={handleLogout} disabled={pending}>
            {logoutLabel}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
