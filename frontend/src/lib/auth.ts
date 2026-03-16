import { create } from 'zustand';
import type { User } from './api';

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

const TOKEN_KEY = 'token';

function getValidToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
  return token;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: getValidToken(),
  user: null,

  setAuth: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ token: null, user: null });
  },
}));
