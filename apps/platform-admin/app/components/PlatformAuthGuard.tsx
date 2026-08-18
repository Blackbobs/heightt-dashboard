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

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      if (isLoading) {
        return;
      }

      try {
        if (token) {
          if (user) {
            // Check if user has ANY admin role
            const isAdmin = user.adminTypes && user.adminTypes.length > 0;

            if (!isAdmin) {
              clearUser();
              if (mounted) {
                router.replace("/platform/login");
              }
              return;
            }

            if (mounted) {
              setChecking(false);
            }
            return;
          }

          try {
            const userData = await platformApi.getCurrentUser();
            
            const isAdmin = userData?.adminTypes && userData.adminTypes.length > 0;

            if (!isAdmin) {
              clearUser();
              if (mounted) {
                router.replace("/platform/login");
              }
              return;
            }

            setAuth(token, userData);
            if (mounted) {
              setChecking(false);
            }
            return;
          } catch (err) {
            clearUser();
            if (mounted) {
              router.replace("/platform/login");
            }
            return;
          }
        }

        clearUser();
        if (mounted) {
          router.replace("/platform/login");
        }
      } catch (err) {
        console.error("Auth check error:", err);
        clearUser();
        if (mounted) {
          router.replace("/platform/login");
        }
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