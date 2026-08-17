import { useSyncExternalStore } from "react";
import { UserResponseDto } from "@/lib/api/types";

interface AuthState {
  token: string | null;
  user: UserResponseDto | null;
  isLoading: boolean;
}

let state: AuthState = {
  token: null,
  user: null,
  isLoading: false,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function getState() {
  return state;
}

export function setAuth(token: string, user: UserResponseDto | null = null) {
  state = { ...state, token, user };
  notify();
}

export function clearUser() {
  state = { token: null, user: null, isLoading: false };
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
    setAuth,
    clearUser,
  };
}

// Attach getState for API parity with zustand-style usage
(useAuthStore as any).getState = getState;
