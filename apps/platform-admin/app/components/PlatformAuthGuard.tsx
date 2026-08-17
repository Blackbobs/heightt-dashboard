"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { platformApi } from "@/lib/api/platform";
import { setAuth } from "@/store/auth-store";

export default function PlatformAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const user = await platformApi.getCurrentUser();
        // If server uses cookie-based auth, populate the client auth store
        // with a placeholder token so hooks that gate on token run.
        setAuth("cookie", user as any);
        if (mounted) setChecking(false);
      } catch (err) {
        // Not authenticated — redirect to signin
        router.push("/signin");
      }
    }

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-gray-500">Checking authentication…</div>
      </div>
    );
  }

  return <>{children}</>;
}
