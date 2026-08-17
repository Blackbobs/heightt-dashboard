import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { platformApi, AdminUser } from '@/lib/api/platform';
import { platformQueryKeys } from '@/lib/api/platformKeys';
import { useAuthStore } from '@/store/auth-store';

export function usePlatformUser() {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.auth.user,
    queryFn: () => platformApi.getCurrentUser(),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePlatformLogin() {
  const queryClient = useQueryClient();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: ({ identifier, password }: { identifier: string; password: string }) =>
      platformApi.login(identifier, password),
    onSuccess: (data) => {
      setAuth(data.accessToken, data);
      queryClient.invalidateQueries({ queryKey: platformQueryKeys.auth.user });
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