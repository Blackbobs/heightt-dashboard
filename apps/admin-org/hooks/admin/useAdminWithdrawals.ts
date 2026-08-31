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
  academicSessionId?: string;
  startDate?: string;
  endDate?: string;
}) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: adminQueryKeys.withdrawals.all(params),
    queryFn: () => adminApi.getWithdrawals(params),
    enabled: !!token && !!params?.organizationId,
    staleTime: 2 * 60 * 1000,
    refetchInterval: (query) =>
      query.state.data?.data?.some((item) =>
        item.status === "PENDING" || item.status === "PROCESSING",
      )
        ? 30_000
        : false,
  });
}

export function useAdminWithdrawal(id: string) {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: adminQueryKeys.withdrawals.one(id),
    queryFn: async () => {
      const withdrawal = await adminApi.getWithdrawal(id);
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.withdrawals.all() });
      queryClient.invalidateQueries({ queryKey: ["admin", "finance", "wallet"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "finance", "organization-overview"] });
      return withdrawal;
    },
    enabled: !!token && !!id,
    staleTime: 0,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "PENDING" || status === "PROCESSING" ? 10_000 : false;
    },
    refetchIntervalInBackground: false,
  });
}

export function useOrganizationWithdrawalQuote(
  organizationId: string,
  amount?: number,
) {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ["admin", "finance", "withdrawal-quote", organizationId, amount],
    queryFn: () => adminApi.getWithdrawalQuote({
      type: "ORGANIZATION",
      organizationId,
      amount,
    }),
    enabled: !!token && !!organizationId,
    staleTime: 0,
    retry: false,
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
    retry: false,
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
      queryClient.invalidateQueries({
        queryKey: ["admin", "finance", "withdrawal-quote"],
      });
    },
  });
}
