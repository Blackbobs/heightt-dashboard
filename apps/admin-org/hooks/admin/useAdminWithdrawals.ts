// apps/admin-org/hooks/admin/useAdminWithdrawals.ts
import { useEffect, useRef } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { adminApi, adminQueryKeys } from "@/lib/api/admin";
import { useAuthStore } from "@/store/auth-store";

/** Views a withdrawal changes: the list, the held wallet balance, and the
 * organisation finance overview. */
function invalidateWithdrawalViews(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: adminQueryKeys.withdrawals.all() });
  queryClient.invalidateQueries({ queryKey: ["admin", "finance", "wallet"] });
  queryClient.invalidateQueries({
    queryKey: ["admin", "finance", "organization-overview"],
  });
}

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

  const query = useQuery({
    queryKey: adminQueryKeys.withdrawals.one(id),
    queryFn: () => adminApi.getWithdrawal(id),
    enabled: !!token && !!id,
    staleTime: 0,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "PENDING" || status === "PROCESSING" ? 10_000 : false;
    },
    refetchIntervalInBackground: false,
  });

  // Refresh the list and wallet when the payout moves on. This lives here
  // rather than in the query function, which would invalidate this same query
  // and refetch it in a loop.
  const status = query.data?.status;
  const previousStatus = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (status && previousStatus.current && previousStatus.current !== status) {
      invalidateWithdrawalViews(queryClient);
    }
    previousStatus.current = status;
  }, [status, queryClient]);

  return query;
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
    // A payout the provider rejects still leaves a FAILED withdrawal and a
    // refunded wallet behind, so the failure path refreshes the same views.
    onSettled: () => {
      invalidateWithdrawalViews(queryClient);
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.finance.transactions(),
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "finance", "withdrawal-quote"],
      });
    },
  });
}
