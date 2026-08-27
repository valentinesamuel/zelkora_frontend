import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../auth/auth.css';
import { useAuth } from '../auth/useAuth';

// The single protected page: full name, role, logout. Rendered ONLY inside
// <RequireAuth>, so `status === 'authed'` and `user !== null` are guaranteed by
// construction. `user.fullName` comes from GET /auth/me (B1) — it is NOT in the
// JWT. `role` is displayed, never branched on (INV-22).
export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  if (user === null) {
    // Unreachable behind <RequireAuth>. A null here means getMe() failed but
    // `status` still became 'authed' — a real bug. Fail loudly rather than
    // masking it with an optional-chained fallback.
    throw new Error('ProfilePage rendered without an authenticated user');
  }

  async function handleLogout() {
    // Disable the button while the request is in flight: a double-click
    // otherwise fires a second POST /auth/logout with an already-blocklisted
    // JTI -> 401 noise. `logout()` in AuthContext swallows API errors and
    // clears local state unconditionally.
    setPending(true);
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Profile</h1>

        <dl style={{ margin: '0 0 1.25rem', display: 'grid', gap: '0.75rem' }}>
          <div>
            <dt className="auth-label" style={{ marginBottom: '0.15rem' }}>
              Name
            </dt>
            <dd style={{ margin: 0, color: '#1a1c1f' }}>{user.fullName}</dd>
          </div>
          <div>
            <dt className="auth-label" style={{ marginBottom: '0.15rem' }}>
              Role
            </dt>
            <dd style={{ margin: 0, color: '#1a1c1f' }}>{user.role}</dd>
          </div>
        </dl>

        <button
          className="auth-button"
          type="button"
          onClick={handleLogout}
          disabled={pending}
        >
          {pending ? 'Logging out…' : 'Log out'}
        </button>
      </div>
    </main>
  );
}
