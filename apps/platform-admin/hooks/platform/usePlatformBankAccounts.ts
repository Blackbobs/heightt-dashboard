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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.bankAccounts(),
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
