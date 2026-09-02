// apps/admin-org/components/AuthHydrator.tsx

"use client";

import { useEffect, ReactNode } from "react";
import { useAuthStore } from "@/store/auth-store";

export function AuthHydrator({ children }: { children: ReactNode }) {
  const { _hasHydrated, setHasHydrated } = useAuthStore();

  useEffect(() => {
    // Zustand exposes hydration completion directly. Subscribing to that event
    // avoids an unbounded polling timer for signed-out users and is safe under
    // React Strict Mode's mount/unmount checks.
    if (useAuthStore.persist.hasHydrated()) {
      setHasHydrated(true);
      return;
    }

    return useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });
  }, [setHasHydrated]);

  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8faff]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#1a5cff] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[#5b6d89] font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
