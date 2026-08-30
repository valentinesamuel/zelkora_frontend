import { create } from 'zustand';

import { setOnAuthFailure } from '../../lib/apiClient';
import * as api from './api';
import { clearAccessToken, setAccessToken } from './tokenStore';
import { AuthStatusEnum } from './types';
import type { LoginRequest, LoginResult, User } from './types';

export interface AuthState {
  status: AuthStatusEnum;
  user: User | null;
  loginWithCredentials(body: LoginRequest): Promise<LoginResult>;
  completeLogin(accessToken: string): Promise<void>;
  logout(): Promise<void>;
  bootstrap(): Promise<void>;
}

let bootstrapped = false;

export const useAuthStore = create<AuthState>((set) => ({
  status: AuthStatusEnum.LOADING,
  user: null,

  loginWithCredentials: (body) => api.login(body),

  completeLogin: async (accessToken) => {
    setAccessToken(accessToken);
    try {
      const me = await api.getMe();
      set({ user: me, status: AuthStatusEnum.AUTHED });
    } catch (err) {
      clearAccessToken();
      set({ user: null, status: AuthStatusEnum.ANON });
      throw err;
    }
  },

  logout: async () => {
    await api.logout().catch(() => {});
    clearAccessToken();
    set({ user: null, status: AuthStatusEnum.ANON });
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
      set({ user: me, status: AuthStatusEnum.AUTHED });
    } catch {
      clearAccessToken();
      set({ user: null, status: AuthStatusEnum.ANON });
    } finally {
      set((s) =>
        s.status === AuthStatusEnum.LOADING
          ? { status: AuthStatusEnum.ANON }
          : {},
      );
    }
  },
}));

setOnAuthFailure(() => {
  clearAccessToken();
  useAuthStore.setState({ user: null, status: AuthStatusEnum.ANON });
});
