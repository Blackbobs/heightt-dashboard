// hooks/usePlatformAdmin.ts
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { platformApi } from "@/lib/api/platform";
import { clearUser } from "@/store/auth-store";

export function usePlatformAdmin() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const user = await platformApi.getCurrentUser();
        const isPlatformAdmin =
          user?.isPlatformAdmin === true ||
          user?.userType === "PLATFORM_ADMIN" ||
          user?.roles?.includes("PLATFORM_ADMIN") ||
          user?.adminTypes?.includes("PLATFORM_ADMIN");

        setIsAdmin(isPlatformAdmin);

        if (!isPlatformAdmin) {
          clearUser(); // Clear auth state
          router.push("/signin");
        }
      } catch (err) {
        clearUser(); // Clear auth state on error
        router.push("/signin");
      } finally {
        setLoading(false);
      }
    }

    checkAdmin();
  }, [router]);

  return { isAdmin, loading };
}
