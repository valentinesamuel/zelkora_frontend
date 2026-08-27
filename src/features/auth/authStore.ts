import { create } from 'zustand';

import { setOnAuthFailure } from '../../lib/apiClient';
import * as api from './api';
import { clearAccessToken, setAccessToken } from './tokenStore';
import type { AuthStatus, LoginRequest, LoginResult, User } from './types';

export interface AuthState {
  status: AuthStatus;
  user: User | null;
  loginWithCredentials(body: LoginRequest): Promise<LoginResult>;
  completeLogin(accessToken: string): Promise<void>;
  logout(): Promise<void>;
  bootstrap(): Promise<void>;
}

let bootstrapped = false;

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  user: null,

  loginWithCredentials: (body) => api.login(body),

  completeLogin: async (accessToken) => {
    setAccessToken(accessToken);
    try {
      const me = await api.getMe();
      set({ user: me, status: 'authed' });
    } catch (err) {
      // getMe failed after a successful MFA verify: fall back to 'anon' and
      // surface the error rather than hanging on a half-authenticated state.
      clearAccessToken();
      set({ user: null, status: 'anon' });
      throw err;
    }
  },

  logout: async () => {
    // The `.catch` is deliberate: a network failure or already-expired token
    // must NEVER trap the user in a logged-in-looking UI. Local state wins.
    await api.logout().catch(() => { });
    clearAccessToken();
    set({ user: null, status: 'anon' });
  },

  bootstrap: async () => {
    if (bootstrapped) {
      return;
    }
    bootstrapped = true;

    // MUST NOT throw uncaught: an unhandled rejection here would leave `status`
    // stuck on 'loading' and the app rendering a spinner forever. The `finally`
    // below is the backstop — whatever happens, we leave the 'loading' state.
    try {
      const { accessToken } = await api.refresh();
      setAccessToken(accessToken);
      const me = await api.getMe();
      set({ user: me, status: 'authed' });
    } catch {
      clearAccessToken();
      set({ user: null, status: 'anon' });
    } finally {
      // Defense-in-depth: guarantee the app never renders the bootstrap spinner
      // forever. On the happy path 'authed' is already set, so this updater is a
      // no-op; any early/uncaught exit lands on 'anon'.
      set((s) => (s.status === 'loading' ? { status: 'anon' } : {}));
    }
  },
}));

// One-way dependency arrow authStore -> apiClient (INV-13). apiClient signals
// auth failure by calling this callback; it never imports this file.
setOnAuthFailure(() => {
  clearAccessToken();
  useAuthStore.setState({ user: null, status: 'anon' });
});
