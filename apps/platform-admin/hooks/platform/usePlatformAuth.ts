// hooks/platform/usePlatformAuth.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { platformApi, UserResponseDto } from "@/lib/api/platform";
import { platformQueryKeys } from "@/lib/api/platformKeys";
import { useAuthStore } from "@/store/auth-store";

export function usePlatformUser() {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.auth.user,
    queryFn: () => platformApi.getCurrentUser(),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function usePlatformLogin() {
  const queryClient = useQueryClient();
  const { setAuth, clearUser } = useAuthStore();

  return useMutation({
    mutationFn: ({ identifier, password }: { identifier: string; password: string }) =>
      platformApi.login(identifier, password),
    onSuccess: (data) => {
      console.log("🔐 usePlatformLogin - onSuccess called with data:", data);
      
      if (data) {
        const userDto: UserResponseDto = {
          id: data.id,
          email: data.email,
          username: data.username,
          emailVerified: true,
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          profile: {
            firstName: data.firstName,
            lastName: data.lastName,
            onboardingStep: data.onboardingStep,
            onboardingCompleted: data.onboardingCompleted,
            verificationStatus: data.verificationStatus,
          },
          isPlatformAdmin: true,
          userType: "PLATFORM_ADMIN",
        };
        const token = data.accessToken || "cookie-auth";
        setAuth(token, userDto);
      }
      
      // Invalidate user query to trigger refetch
      queryClient.invalidateQueries({ queryKey: platformQueryKeys.auth.user });
      // Invalidate other queries that depend on auth
      queryClient.invalidateQueries({ queryKey: ["platform"] });
    },
    onError: (error) => {
      console.error("🔐 usePlatformLogin - Error:", error);
      clearUser();
    },
  });
}

export function usePlatformLogout() {
  const queryClient = useQueryClient();
  const { clearUser } = useAuthStore();

  return useMutation({
    mutationFn: () => platformApi.logout(),
    onSuccess: () => {
      clearUser();
      queryClient.clear();
    },
  });
}