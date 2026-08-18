// src/app/platform/layout.tsx

"use client";

import React, { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppProvider } from "../context/AppContext";
import PlatformShell from "../components/PlatformShell";
import PlatformAuthGuard from "../components/PlatformAuthGuard";
import { useAuthStore } from "@/store/auth-store";

export default function PlatformLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      const isAdmin = user?.adminTypes && user.adminTypes.length > 0;

      if (!isAuthenticated || !isAdmin) {
        router.replace("/signin");
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-gray-500">Loading…</div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.adminTypes?.length) {
    return null;
  }

  return (
    <AppProvider>
      <PlatformAuthGuard>
        <PlatformShell>{children}</PlatformShell>
      </PlatformAuthGuard>
    </AppProvider>
  );
}