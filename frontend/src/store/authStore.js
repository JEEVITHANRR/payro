// src/store/authStore.js — Global auth state with Zustand
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:        null,
      accessToken: null,
      isLoading:   false,

      // ─── Actions ──────────────────────────────────
      setAuth: (user, accessToken) =>
        set({ user, accessToken, isLoading: false }),

      setAccessToken: (accessToken) =>
        set({ accessToken }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      logout: () =>
        set({ user: null, accessToken: null, isLoading: false }),

      setLoading: (isLoading) => set({ isLoading }),

      // ─── Computed ─────────────────────────────────
      isAuthenticated: () => !!get().accessToken && !!get().user,

      hasRole: (...roles) => {
        const user = get().user;
        return user ? roles.includes(user.role) : false;
      },

      isAdmin: () => {
        const { SUPER_ADMIN: _, ...adminRoles } = {};
        const user = get().user;
        return user
          ? ['SUPER_ADMIN', 'ADMIN'].includes(user.role)
          : false;
      },
    }),
    {
      name: 'payro-auth',
      partialize: (state) => ({
        user:        state.user,
        accessToken: state.accessToken,
      }),
    }
  )
);
