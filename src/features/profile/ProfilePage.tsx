import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../auth/auth.css';
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
