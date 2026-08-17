import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { platformApi, Institution } from "@/lib/api/platform";
import { platformQueryKeys } from "@/lib/api/platformKeys";
import { useAuthStore } from "@/store/auth-store";

export function usePlatformInstitutions(params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.institutions.all(params),
    queryFn: () => platformApi.getInstitutions(params),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePlatformInstitution(id: string) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.institutions.one(id),
    queryFn: () => platformApi.getInstitution(id),
    enabled: !!token && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateInstitution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Institution>) =>
      platformApi.createInstitution(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.institutions.all(),
      });
    },
  });
}

export function useUpdateInstitution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Institution> }) =>
      platformApi.updateInstitution(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.institutions.all(),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.institutions.one(variables.id),
      });
    },
  });
}

export function useDeleteInstitution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => platformApi.deleteInstitution(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.institutions.all(),
      });
    },
  });
}
