import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { setOnAuthFailure } from '../../lib/apiClient';
import * as api from './api';
import { clearAccessToken, setAccessToken } from './tokenStore';
import type { AuthStatus, LoginRequest, LoginResult, User } from './types';

export interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  loginWithCredentials(body: LoginRequest): Promise<LoginResult>;
  completeLogin(accessToken: string): Promise<void>;
  logout(): Promise<void>;
}

// Consumed only through `useAuth()` (useAuth.ts), which throws when the value is
// still `undefined` (used outside the provider).
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);

  // StrictMode double-invokes effects in dev. Without this guard the mount
  // effect fires `bootstrap()` twice -> two concurrent POST /auth/refresh with
  // the same cookie value -> the backend's atomic rotation revokes the token
  // the second call presents -> forced logout on every page load (KFM-1 / R1).
  // Belt and braces: apiClient's single-flight `refreshOnce()` is the second
  // line of defence.
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (bootstrapped.current) {
      return;
    }
    bootstrapped.current = true;

    // MUST NOT throw uncaught: an unhandled rejection here would leave `status`
    // stuck on 'loading' and the app rendering a spinner forever. The `finally`
    // below is the backstop — whatever happens, we leave the 'loading' state.
    async function bootstrap(): Promise<void> {
      try {
        const { accessToken } = await api.refresh();
        setAccessToken(accessToken);
        const me = await api.getMe();
        setUser(me);
        setStatus('authed');
      } catch {
        clearAccessToken();
        setUser(null);
        setStatus('anon');
      } finally {
        // Defense-in-depth: guarantee the app never renders the bootstrap
        // spinner forever. On the happy path 'authed' is already set, so this
        // updater is a no-op; any early/uncaught exit lands on 'anon'.
        setStatus((s) => (s === 'loading' ? 'anon' : s));
      }
    }

    void bootstrap();
  }, []);

  useEffect(() => {
    // One-way dependency arrow AuthContext -> apiClient (INV-13). apiClient
    // signals auth failure by calling this callback; it never imports this file.
    setOnAuthFailure(() => {
      clearAccessToken();
      setUser(null);
      setStatus('anon');
    });
  }, []);

  const loginWithCredentials = useCallback(
    (body: LoginRequest) => api.login(body),
    [],
  );

  const completeLogin = useCallback(async (accessToken: string) => {
    setAccessToken(accessToken);
    try {
      const me = await api.getMe();
      setUser(me);
      setStatus('authed');
    } catch (err) {
      // getMe failed after a successful MFA verify: fall back to 'anon' and
      // surface the error rather than hanging on a half-authenticated state.
      clearAccessToken();
      setUser(null);
      setStatus('anon');
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    // The `.catch` is deliberate: a network failure or already-expired token
    // must NEVER trap the user in a logged-in-looking UI. Local state wins.
    await api.logout().catch(() => {});
    clearAccessToken();
    setUser(null);
    setStatus('anon');
  }, []);

  const value: AuthContextValue = {
    status,
    user,
    loginWithCredentials,
    completeLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
