// apps/admin-org/hooks/admin/useAdminAuth.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { adminApi, adminQueryKeys, AdminUser } from "@/lib/api/admin";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";

export function useAdminUser() {
  const { token, setUser } = useAuthStore();

  const query = useQuery({
    queryKey: adminQueryKeys.auth.user,
    queryFn: () => adminApi.getCurrentUser() as Promise<AdminUser>,
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });

  // The /v1/auth/me response is the authoritative source for the user's
  // admin types & scopes. Sync it back into the auth store so AdminContext,
  // role gating, and org/scope switching all resolve roles from the full
  // payload (adminTypes, adminScopes, isPlatformAdmin, ...) rather than the
  // minimal object stored at login time.
  useEffect(() => {
    if (query.data && token) {
      setUser(query.data as AdminUser);
    }
  }, [query.data, token, setUser]);

  return query;
}

export function useAdminLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setAuth, setLoading } = useAuthStore();

  return useMutation({
    mutationFn: ({
      identifier,
      password,
    }: {
      identifier: string;
      password: string;
    }) => adminApi.login(identifier, password),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (data) => {
      console.log("Login successful, setting auth data:", data);

      // Detect whether the signed-in user actually holds admin privileges. The
      // /v1/auth/admin/login carries the user's admin role info (adminTypes,
      // roles, userType, isPlatformAdmin, ...). We must persist it here so the
      // AdminGuard (which runs on the very next render after redirect) sees the
      // user as an admin instead of treating them as a non-admin and bouncing
      // them back to /signin?error=no_admin_access before the /v1/auth/me
      // refetch can complete.
      const adminTypes = data.adminTypes || [];
      const isPlatformAdmin = data.isPlatformAdmin === true;
      const hasAdminAccess = adminTypes.length > 0 || isPlatformAdmin;

      // Set auth with the token and user data
      setAuth(data.accessToken, {
        id: data.id,
        email: data.email,
        username: data.username,
        emailVerified: true,
        status: "ACTIVE",
        profile: {
          firstName: data.firstName,
          lastName: data.lastName,
          onboardingStep: data.onboardingStep,
          onboardingCompleted: data.onboardingCompleted,
          verificationStatus: data.verificationStatus,
        },
        // Add other required fields
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        adminScopes: [], // Will be populated from the backend
        // Role info from the login response so the guard resolves admin access
        isPlatformAdmin,
        adminTypes,
        roles: adminTypes,
        userType: data.userType || (hasAdminAccess ? "ADMIN" : "USER"),
        isAdminSession: hasAdminAccess,
        highestAdminType: isPlatformAdmin
          ? "PLATFORM_ADMIN"
          : adminTypes[0] || null,
      } as unknown as AdminUser);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.auth.user });

      // Navigate to admin dashboard
      router.push("/");
    },
    onError: (error) => {
      console.error("Login failed:", error);
      setLoading(false);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
}

export function useAdminLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { clearUser } = useAuthStore();

  return useMutation({
    mutationFn: () => adminApi.logout(),
    onSuccess: () => {
      clearUser();
      queryClient.clear();
      router.push("/signin");
    },
  });
}

export function useAdminLogoutAll() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { clearUser } = useAuthStore();

  return useMutation({
    mutationFn: () => adminApi.logoutAll(),
    onSuccess: () => {
      clearUser();
      queryClient.clear();
      router.push("/signin");
    },
  });
}
