import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { platformApi } from "@/lib/api/platform";
import { platformQueryKeys } from "@/lib/api/platformKeys";
import { useAuthStore } from "@/store/auth-store";

export function usePlatformAuditLogs(params?: {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  entity?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
}) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.auditLogs.all(params),
    queryFn: () => platformApi.getAuditLogs(params),
    enabled: !!token,
    staleTime: 2 * 60 * 1000,
  });
}

export function usePlatformAuditSummary(params?: {
  startDate?: string;
  endDate?: string;
}) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.auditLogs.summary(params),
    queryFn: () => platformApi.getAuditSummary(params),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}
