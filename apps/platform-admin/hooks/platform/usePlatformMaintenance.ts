import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { platformApi, MaintenanceMode } from "@/lib/api/platform";
import { platformQueryKeys } from "@/lib/api/platformKeys";
import { useAuthStore } from "@/store/auth-store";

export function usePlatformMaintenance() {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.maintenance.status,
    queryFn: () => platformApi.getMaintenanceStatus(),
    enabled: !!token,
    staleTime: 30 * 1000, // 30 seconds - refresh frequently
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

export function useSetMaintenanceMode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      enabled: boolean;
      message?: string;
      startsAt?: string;
      endsAt?: string;
    }) => platformApi.setMaintenanceMode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.maintenance.status,
      });
    },
  });
}
