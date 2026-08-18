// hooks/platform/usePlatformAuth.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { platformApi } from "@/lib/api/platform";
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
      
      // The response should have accessToken and user data
      if (data.accessToken) {
        console.log("🔐 usePlatformLogin - Setting auth with token:", data.accessToken.substring(0, 20) + "...");
        setAuth(data.accessToken, data);
      } else {
        console.error("🔐 usePlatformLogin - No accessToken in response!", data);
        // If no token, use the data as user and a placeholder token
        setAuth("cookie-auth", data);
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