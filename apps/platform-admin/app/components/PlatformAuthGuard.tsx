// src/app/components/PlatformAuthGuard.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { platformApi } from "@/lib/api/platform";

export default function PlatformAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { token, user, isAuthenticated, isLoading, setAuth, clearUser } =
    useAuthStore();
  const [checking, setChecking] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Mark when we're on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // True only for users with PLATFORM_ADMIN privileges (the /platform dashboard
  // is exclusively for platform admins, not any other admin type).
  const isPlatformAdminUser = (u: any): boolean =>
    u?.isPlatformAdmin === true ||
    u?.userType === "PLATFORM_ADMIN" ||
    u?.roles?.includes("PLATFORM_ADMIN") ||
    u?.adminTypes?.includes("PLATFORM_ADMIN");

  // Automatic logout: revoke the session server-side (best effort), clear the
  // local auth state, and send the user to the sign-in page.
  function logout() {
    try {
      void platformApi.logout();
    } catch {
      // Ignore network failures; local logout and redirect still apply.
    }
    clearUser();
    router.replace("/signin");
  }

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      if (isLoading) {
        return;
      }

      try {
        if (token) {
          if (user) {
            // Only platform admins may access this dashboard.
            if (!isPlatformAdminUser(user)) {
              if (mounted) logout();
              return;
            }

            if (mounted) setChecking(false);
            return;
          }

          try {
            const userData = await platformApi.getCurrentUser();

            // Fetching the current user returned a valid session, but if they
            // are not a platform admin, automatically log them out.
            if (!isPlatformAdminUser(userData)) {
              if (mounted) logout();
              return;
            }

            setAuth(token, userData);
            if (mounted) setChecking(false);
            return;
          } catch (err) {
            if (mounted) logout();
            return;
          }
        }

        if (mounted) logout();
      } catch (err) {
        console.error("Auth check error:", err);
        if (mounted) logout();
      }
    }

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [router, token, user, isAuthenticated, isLoading, setAuth, clearUser]);

  // Show loading state only on client to avoid hydration mismatch
  if (!isClient || isLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-gray-500">Checking authentication…</div>
      </div>
    );
  }

  return <>{children}</>;
}