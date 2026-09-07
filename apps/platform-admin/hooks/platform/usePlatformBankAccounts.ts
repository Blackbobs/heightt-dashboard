import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { platformApi } from "@/lib/api/platform";
import {
  BankAccountResponseDto,
  CreateBankAccountDto,
  UpdateBankAccountDto,
} from "@/lib/api/types";
import { platformQueryKeys } from "@/lib/api/platformKeys";
import { useAuthStore } from "@/store/auth-store";

export function usePlatformBankAccounts(params?: {
  page?: number;
  limit?: number;
}) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.finance.bankAccounts(params),
    queryFn: () => platformApi.getBankAccounts(params),
    enabled: !!token,
    staleTime: 3 * 60 * 1000,
  });
}

export function usePlatformBankAccount(id: string) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.finance.bankAccount(id),
    queryFn: () => platformApi.getBankAccount(id),
    enabled: !!token && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePlatformSupportedBanks() {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ["platform", "finance", "supported-banks", "NG"],
    queryFn: () => platformApi.getSupportedBanks("NG"),
    enabled: !!token,
    staleTime: 60 * 60 * 1000,
  });
}

export function useResolvePlatformBankAccount() {
  return useMutation({ mutationFn: platformApi.resolveBankAccount });
}

export function useCreateBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBankAccountDto) =>
      platformApi.createBankAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.bankAccounts(),
      });
    },
  });
}

export function useUpdateBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBankAccountDto }) =>
      platformApi.updateBankAccount(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.bankAccounts(),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.bankAccount(variables.id),
      });
    },
  });
}

export function useDeleteBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => platformApi.deleteBankAccount(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueriesData(
        { queryKey: ["platform", "finance", "bank-accounts"] },
        (current: unknown) => {
          if (!current || typeof current !== "object" || !("data" in current)) {
            return current;
          }

          const result = current as {
            data: Array<{ id: string }>;
            meta?: { total: number };
          };
          const data = result.data.filter(
            (account) => account.id !== deletedId,
          );
          if (data.length === result.data.length) return current;

          return {
            ...result,
            data,
            meta: result.meta
              ? { ...result.meta, total: Math.max(0, result.meta.total - 1) }
              : result.meta,
          };
        },
      );
      queryClient.removeQueries({
        queryKey: platformQueryKeys.finance.bankAccount(deletedId),
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ["platform", "finance", "bank-accounts"],
      });
    },
  });
}

export function useSetDefaultBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => platformApi.setDefaultBankAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.bankAccounts(),
      });
    },
  });
}

export function useRegisterPayoutDestination() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => platformApi.registerPayoutDestination(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.bankAccounts(),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.bankAccount(id),
      });
    },
  });
}
