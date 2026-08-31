// apps/admin-org/hooks/admin/useAdminBankAccounts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, adminQueryKeys } from "@/lib/api/admin";
import { useAuthStore } from "@/store/auth-store";

export function useAdminBankAccounts(params?: {
  page?: number;
  limit?: number;
}) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: adminQueryKeys.bankAccounts.all(params),
    queryFn: () => adminApi.getBankAccounts(params),
    enabled: !!token,
    staleTime: 3 * 60 * 1000,
  });
}

export function useAdminBankAccount(id: string) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: adminQueryKeys.bankAccounts.one(id),
    queryFn: () => adminApi.getBankAccount(id),
    enabled: !!token && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminSupportedBanks() {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ["admin", "finance", "supported-banks", "NG"],
    queryFn: () => adminApi.getSupportedBanks("NG"),
    enabled: !!token,
    staleTime: 60 * 60 * 1000,
  });
}

export function useResolveAdminBankAccount() {
  return useMutation({ mutationFn: adminApi.resolveBankAccount });
}

export function useCreateBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      bankName: string;
      accountNumber: string;
      accountName: string;
      bankCode: string;
      isDefault?: boolean;
    }) => adminApi.createBankAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.bankAccounts.all(),
      });
    },
  });
}

export function useUpdateBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      adminApi.updateBankAccount(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.bankAccounts.all(),
      });
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.bankAccounts.one(variables.id),
      });
    },
  });
}

export function useDeleteBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.deleteBankAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.bankAccounts.all(),
      });
    },
  });
}

export function useSetDefaultBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.setDefaultBankAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.bankAccounts.all(),
      });
    },
  });
}

export function useRegisterPayoutDestination() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.registerPayoutDestination(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.bankAccounts.all(),
      });
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.bankAccounts.one(id),
      });
    },
  });
}
