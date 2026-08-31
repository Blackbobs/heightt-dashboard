// apps/admin-org/store/auth-store.ts

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AdminUser } from "@/lib/api/admin";

interface AuthState {
  token: string | null;
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
}

interface AuthActions {
  setAuth: (token: string, user: AdminUser) => void;
  setUser: (user: AdminUser) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  refreshUser: () => Promise<void>;
  setHasHydrated: (state: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  token: null,
  user: null,
  isLoading: false,
  isAuthenticated: false,
  _hasHydrated: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setAuth: (token: string, user: AdminUser) => {
        console.log("Setting auth with token and user:", { token, user });
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        // Verify it's saved
        const state = get();
        console.log("Auth state after setAuth:", state);
      },

      setUser: (user: AdminUser) => {
        set({ user, isAuthenticated: true });
      },

      clearUser: () => {
        console.log("Clearing auth state");
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        localStorage.removeItem("admin-auth-storage");
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },

      refreshUser: async () => {
        const { token } = get();
        if (!token) {
          set({ isAuthenticated: false });
          return;
        }

        try {
          set({ isLoading: true });
          const { adminApi } = await import("@/lib/api/admin");
          const user = await adminApi.getCurrentUser();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          console.error("Failed to refresh user:", error);
          set({
            isAuthenticated: false,
            isLoading: false,
            token: null,
            user: null,
          });
        }
      },
    }),
    {
      name: "admin-auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        console.log("Rehydrating auth storage");
        return (state) => {
          if (state) {
            console.log("Rehydrated state:", state);
            // Ensure isAuthenticated is set correctly
            if (state.token && state.user) {
              state.isAuthenticated = true;
            }
            // Mark as hydrated
            state.setHasHydrated(true);
          }
        };
      },
    },
  ),
);

// Helper function to get state outside of React components
export const getAuthState = () => {
  return useAuthStore.getState();
};

// Helper function to clear auth state
export const clearAuth = () => {
  const { clearUser } = useAuthStore.getState();
  clearUser();
};
