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
      clearAccessToken();
      set({ user: null, status: 'anon' });
      throw err;
    }
  },

  logout: async () => {
    await api.logout().catch(() => {});
    clearAccessToken();
    set({ user: null, status: 'anon' });
  },

  bootstrap: async () => {
    if (bootstrapped) {
      return;
    }
    bootstrapped = true;

    try {
      const { accessToken } = await api.refresh();
      setAccessToken(accessToken);
      const me = await api.getMe();
      set({ user: me, status: 'authed' });
    } catch {
      clearAccessToken();
      set({ user: null, status: 'anon' });
    } finally {
      set((s) => (s.status === 'loading' ? { status: 'anon' } : {}));
    }
  },
}));

setOnAuthFailure(() => {
  clearAccessToken();
  useAuthStore.setState({ user: null, status: 'anon' });
});
