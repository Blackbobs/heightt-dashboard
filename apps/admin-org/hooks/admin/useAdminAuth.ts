// apps/admin-org/hooks/admin/useAdminAuth.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, adminQueryKeys, AdminUser } from "@/lib/api/admin";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";

export function useAdminUser() {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: adminQueryKeys.auth.user,
    queryFn: () => adminApi.getCurrentUser() as Promise<AdminUser>,
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
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
      } as AdminUser);

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
