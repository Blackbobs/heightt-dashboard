// src/store/auth-store.ts

import { useSyncExternalStore } from "react";
import { UserResponseDto } from "@/lib/api/types";

interface AuthState {
  token: string | null;
  user: UserResponseDto | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Load from localStorage on startup
const loadState = (): AuthState | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("auth-storage");
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        token: parsed.token || null,
        user: parsed.user || null,
        isLoading: false,
        isAuthenticated: parsed.isAuthenticated || false,
      };
    }
  } catch (e) {
    console.error("Failed to load auth state:", e);
  }
  return null;
};

const savedState = loadState();

const initialState: AuthState = savedState || {
  token: null,
  user: null,
  isLoading: false,
  isAuthenticated: false,
};

let state: AuthState = initialState;

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

// Save to localStorage whenever state changes
function persistState(newState: AuthState) {
  if (typeof window === "undefined") return;
  try {
    const data = JSON.stringify(newState);
    localStorage.setItem("auth-storage", data);
  } catch (e) {
    console.error("Failed to persist auth state:", e);
  }
}

export function getState() {
  return state;
}

export function setAuth(token: string, user: UserResponseDto | null = null) {
  const newState = {
    ...state,
    token,
    user,
    isLoading: false,
    isAuthenticated: !!token && !!user,
  };
  state = newState;
  persistState(newState);
  notify();
}

export function setLoading(loading: boolean) {
  const newState = { ...state, isLoading: loading };
  state = newState;
  notify();
}

export function clearUser() {
  const newState = {
    token: null,
    user: null,
    isLoading: false,
    isAuthenticated: false,
  };
  state = newState;
  persistState(newState);
  notify();
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAuthStore() {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );

  return {
    token: snapshot.token,
    user: snapshot.user,
    isLoading: snapshot.isLoading,
    isAuthenticated: snapshot.isAuthenticated,
    setAuth,
    setLoading,
    clearUser,
  };
}

// Attach getState for API parity with zustand-style usage
(useAuthStore as any).getState = getState;