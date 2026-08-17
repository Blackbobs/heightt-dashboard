import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { platformApi, User } from "@/lib/api/platform";
import { platformQueryKeys } from "@/lib/api/platformKeys";
import { useAuthStore } from "@/store/auth-store";

export function usePlatformUsers(params?: {
  page?: number;
  limit?: number;
  email?: string;
  username?: string;
  status?: string;
  createdAfter?: string;
  createdBefore?: string;
  search?: string;
}) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.users.all(params),
    queryFn: () => platformApi.getUsers(params),
    enabled: !!token,
    staleTime: 3 * 60 * 1000,
  });
}

export function usePlatformUser(id: string) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.users.one(id),
    queryFn: () => platformApi.getUser(id),
    enabled: !!token && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { status: string; reason?: string };
    }) => platformApi.updateUserStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.users.all(),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.users.one(variables.id),
      });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => platformApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.users.all(),
      });
    },
  });
}
