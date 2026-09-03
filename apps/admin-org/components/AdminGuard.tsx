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
  const { token, user, isLoading, isAuthenticated, _hasHydrated } =
    useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

      if (isPublicRoute) {
        setIsChecking(false);
        return;
      }

      if (!_hasHydrated) {
        return;
      }

      if (!isAuthenticated || !user || !token) {
        router.replace("/signin");
        setIsChecking(false);
        return;
      }

      // Check if user has any admin type
      const adminTypes = (user as any)?.adminTypes || [];
      const isPlatformAdmin = (user as any)?.isPlatformAdmin || false;
      const hasAdminAccess = adminTypes.length > 0 || isPlatformAdmin;

      if (!hasAdminAccess) {
        router.replace("/signin?error=no_admin_access");
        setIsChecking(false);
        return;
      }

      setIsChecking(false);
    };

    if (!isLoading) {
      checkAuth();
    }
  }, [isAuthenticated, isLoading, user, token, pathname, router, _hasHydrated]);

  // Keep public forms mounted while their own request is pending. Replacing the
  // page here used to erase the sign-in form and its accessible status state.
  if (pathname === "/signin" && _hasHydrated) {
    return <>{children}</>;
  }

  if (isLoading || isChecking || !_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8faff]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#1a5cff] animate-spin" />
          <span className="text-sm text-[#5b6d89] font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  const adminTypes = (user as any)?.adminTypes || [];
  const isPlatformAdmin = (user as any)?.isPlatformAdmin || false;
  const hasAdminAccess = adminTypes.length > 0 || isPlatformAdmin;

  if (!isAuthenticated || !user || !hasAdminAccess) {
    return null;
  }

  return <>{children}</>;
}
