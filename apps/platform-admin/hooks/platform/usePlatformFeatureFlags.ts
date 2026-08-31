import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { platformApi, FeatureFlag, CreateFeatureFlagDto } from "@/lib/api/platform";
import { platformQueryKeys } from "@/lib/api/platformKeys";
import { useAuthStore } from "@/store/auth-store";

export function usePlatformFeatureFlags() {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.featureFlags.all,
    queryFn: () => platformApi.getFeatureFlags(),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFeatureFlagDto) => platformApi.createFeatureFlag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.featureFlags.all,
      });
    },
  });
}

export function useUpdateFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        name?: string;
        description?: string;
        enabled?: boolean;
        percentage?: number;
      };
    }) => platformApi.updateFeatureFlag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.featureFlags.all,
      });
    },
  });
}

export function useDeleteFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => platformApi.deleteFeatureFlag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.featureFlags.all,
      });
    },
  });
}
