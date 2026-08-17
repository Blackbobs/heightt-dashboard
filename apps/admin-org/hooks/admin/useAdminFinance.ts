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
    enabled: !!token,
    staleTime: 3 * 60 * 1000,
  });
}

export function useAdminTransactions(params?: {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: adminQueryKeys.finance.transactions(params),
    queryFn: () => adminApi.getTransactions(params),
    enabled: !!token,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAdminReceipts(params?: {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  organizationId?: string;
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

export function useAdminFinanceDashboard(organizationId: string) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: adminQueryKeys.finance.dashboard(organizationId),
    queryFn: () => adminApi.getFinanceDashboard(organizationId),
    enabled: !!token && !!organizationId,
    staleTime: 5 * 60 * 1000,
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

export function useRequestWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      organizationId: string;
      amount: number;
      bankName: string;
      accountNumber: string;
      accountName: string;
      reason: string;
    }) => adminApi.requestWithdrawal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.finance.transactions(),
      });
    },
  });
}
