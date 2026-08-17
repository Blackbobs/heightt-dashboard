// apps/admin-org/components/AdminGuard.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Loader2 } from "lucide-react";

const PUBLIC_ROUTES = ["/signin"];

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, user, isLoading, isAuthenticated } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

      // If on login page, skip auth check
      if (isPublicRoute) {
        setIsChecking(false);
        return;
      }

      // Check if user is authenticated
      if (!isAuthenticated || !user || !token) {
        router.replace("/signin");
        setIsChecking(false);
        return;
      }

      setIsChecking(false);
    };

    // Only check when auth store is initialized
    if (!isLoading) {
      checkAuth();
    }
  }, [isAuthenticated, isLoading, user, token, pathname, router]);

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8faff]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#1a5cff] animate-spin" />
          <span className="text-sm text-[#5b6d89] font-medium">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  // If on login page, render without auth
  if (pathname === "/signin") {
    return <>{children}</>;
  }

  // If not authenticated, don't render
  if (!isAuthenticated || !user) {
    return null;
  }

  return <>{children}</>;
}