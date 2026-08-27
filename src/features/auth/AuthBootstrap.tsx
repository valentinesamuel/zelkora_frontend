import { useEffect } from 'react';

import { useAuthStore } from './authStore';

// Runs the silent bootstrap refresh once on app load. Renders nothing. Kept as a
// component (rather than a bare effect in App) so App.tsx stays pure routing.
// The module-level `bootstrapped` guard in authStore covers StrictMode's
// double-invoke.
export function AuthBootstrap() {
  useEffect(() => {
    void useAuthStore.getState().bootstrap();
  }, []);

  return null;
}
