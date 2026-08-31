// apps/admin-org/hooks/admin/useAdminFinance.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminApi,
  adminQueryKeys,
  PaymentHistoryStatus,
} from "@/lib/api/admin";
import { useAuthStore } from "@/store/auth-store";
import { useAdminContext } from "@/app/components/AdminContext";

export function useAdminDues(params?: {
  organizationId?: string;
  page?: number;
  limit?: number;
  academicSessionId?: string;
}) {
  const { token } = useAuthStore();
  const { selectedScope } = useAdminContext();
  const scopedParams = { ...params, academicSessionId: selectedScope?.academicSessionId };

  return useQuery({
    queryKey: adminQueryKeys.finance.dues(scopedParams),
    queryFn: () => adminApi.getDues(scopedParams),
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
  academicSessionId?: string;
}) {
  const { token } = useAuthStore();
  const { selectedScope } = useAdminContext();
  const scopedParams = { ...params, academicSessionId: selectedScope?.academicSessionId };

  return useQuery({
    queryKey: adminQueryKeys.finance.transactions(scopedParams),
    queryFn: () => adminApi.getTransactions(scopedParams),
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
  academicSessionId?: string;
}) {
  const { token } = useAuthStore();
  const { selectedScope } = useAdminContext();
  const scopedParams = { ...params, academicSessionId: selectedScope?.academicSessionId };

  return useQuery({
    queryKey: adminQueryKeys.finance.receipts(scopedParams),
    queryFn: () => adminApi.getReceipts(scopedParams),
    enabled: !!token && !!params?.organizationId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminPaymentHistory(params?: {
  page?: number;
  limit?: number;
  status?: PaymentHistoryStatus;
  organizationId?: string;
  payerId?: string;
  academicSessionId?: string;
}) {
  const { token } = useAuthStore();
  const { selectedScope } = useAdminContext();
  const scopedParams = { ...params, academicSessionId: selectedScope?.academicSessionId };

  return useQuery({
    queryKey: adminQueryKeys.finance.paymentHistory(scopedParams),
    queryFn: () => adminApi.getAdminPaymentHistory(scopedParams),
    enabled: !!token && !!params?.organizationId,
    staleTime: 30 * 1000,
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

export function useOrganizationFinanceOverview(organizationId: string) {
  const { token } = useAuthStore();
  const { selectedScope } = useAdminContext();
  const academicSessionId = selectedScope?.academicSessionId;

  return useQuery({
    queryKey: [...adminQueryKeys.finance.organizationOverview(organizationId), academicSessionId],
    queryFn: () => adminApi.getOrganizationFinanceOverview(organizationId, academicSessionId),
    enabled: !!token && !!organizationId,
    staleTime: 30 * 1000,
  });
}

export function useAdminWallet(organizationId: string) {
  const { token } = useAuthStore();
  const { selectedScope } = useAdminContext();
  const academicSessionId = selectedScope?.academicSessionId;

  return useQuery({
    queryKey: [...adminQueryKeys.finance.wallet(organizationId), academicSessionId],
    queryFn: () => adminApi.getWallet(organizationId, academicSessionId),
    enabled: !!token && !!organizationId,
    staleTime: 60 * 1000,
  });
}

export function useCreateDue() {
  const queryClient = useQueryClient();
  const { selectedScope } = useAdminContext();

  return useMutation({
    mutationFn: (data: any) => adminApi.createDue({ ...data, sessionId: selectedScope?.academicSessionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.finance.dues(),
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "finance", "organization-overview"],
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
      queryClient.invalidateQueries({
        queryKey: ["admin", "finance", "organization-overview"],
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
      queryClient.invalidateQueries({
        queryKey: ["admin", "finance", "organization-overview"],
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
      queryClient.invalidateQueries({
        queryKey: ["admin", "finance", "organization-overview"],
      });
    },
  });
}
