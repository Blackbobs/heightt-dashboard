// apps/admin-org/hooks/admin/useAdminFinance.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, adminQueryKeys } from "@/lib/api/admin";
import { useAuthStore } from "@/store/auth-store";

export function useAdminDues(params?: {
  organizationId?: string;
  page?: number;
  limit?: number;
}) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: adminQueryKeys.finance.dues(params),
    queryFn: () => adminApi.getDues(params),
    // Dues are organization-scoped; never fire with a missing/bogus org id.
    enabled: !!token && !!params?.organizationId,
    staleTime: 3 * 60 * 1000,
  });
}

export function useAdminTransactions(params?: {
  page?: number;
  limit?: number;
  organizationId?: string;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: adminQueryKeys.finance.transactions(params),
    queryFn: () => adminApi.getTransactions(params),
    // Transactions are organization-scoped; never fire with a missing/bogus id.
    enabled: !!token && !!params?.organizationId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAdminReceipts(params?: {
  page?: number;
  limit?: number;
  organizationId?: string;
  startDate?: string;
  endDate?: string;
}) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: adminQueryKeys.finance.receipts(params),
    queryFn: () => adminApi.getReceipts(params),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminFinancialOverview(organizationId: string) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: adminQueryKeys.finance.overview(organizationId),
    queryFn: () => adminApi.getFinancialOverview(organizationId),
    enabled: !!token && !!organizationId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminWallet(organizationId: string) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: adminQueryKeys.finance.wallet(organizationId),
    queryFn: () => adminApi.getWallet(organizationId),
    enabled: !!token && !!organizationId,
    staleTime: 60 * 1000,
  });
}

export function useCreateDue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => adminApi.createDue(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.finance.dues(),
      });
    },
  });
}

export function useAssignDue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      adminApi.assignDue(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.finance.dues(),
      });
    },
  });
}

export function useDeleteDue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.deleteDue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.finance.dues(),
      });
    },
  });
}

export function useRequestWithdrawal() {
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
        queryKey: adminQueryKeys.finance.transactions(),
      });
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.withdrawals.all(),
      });
    },
  });
}