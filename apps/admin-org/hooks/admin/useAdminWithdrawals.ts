// apps/admin-org/hooks/admin/useAdminWithdrawals.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, adminQueryKeys } from "@/lib/api/admin";
import { useAuthStore } from "@/store/auth-store";

export function useAdminWithdrawals(params?: {
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
  organizationId?: string;
  startDate?: string;
  endDate?: string;
}) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: adminQueryKeys.withdrawals.all(params),
    queryFn: () => adminApi.getWithdrawals(params),
    enabled: !!token && !!params?.organizationId,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 30 * 1000,
  });
}

export function useAdminWithdrawal(id: string) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: adminQueryKeys.withdrawals.one(id),
    queryFn: () => adminApi.getWithdrawal(id),
    enabled: !!token && !!id,
    staleTime: 0,
    refetchInterval: (query) =>
      query.state.data?.status === "PROCESSING" ? 10_000 : false,
  });
}

export function useRequestOrganizationWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      organizationId: string;
      bankAccountId: string;
      amount: number;
      reason?: string;
    }) => adminApi.requestWithdrawal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.withdrawals.all(),
      });
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.finance.transactions(),
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "finance", "organization-overview"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "finance", "wallet"],
      });
    },
  });
}
