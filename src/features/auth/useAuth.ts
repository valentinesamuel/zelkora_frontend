import { useContext } from 'react';

import { AuthContext, type AuthContextValue } from './AuthContext';

// Throws (rather than returning `undefined`) when used outside <AuthProvider>:
// a silent undefined produces incomprehensible downstream crashes.
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}
