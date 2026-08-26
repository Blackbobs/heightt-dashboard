import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { platformApi } from "@/lib/api/platform";
import {
  UserWithdrawalRequestDto,
  OrganizationWithdrawalRequestDto,
  PlatformWithdrawalRequestDto,
  WithdrawalFiltersDto,
  WithdrawalRejectRequestDto,
} from "@/lib/api/types";
import { platformQueryKeys } from "@/lib/api/platformKeys";
import { useAuthStore } from "@/store/auth-store";

export function usePlatformWithdrawals(params?: WithdrawalFiltersDto) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.finance.withdrawals(params),
    queryFn: () => platformApi.getWithdrawals(params),
    enabled: !!token,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 30 * 1000, // Refetch every 30s for status updates
  });
}

export function usePlatformWithdrawal(id: string) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.finance.withdrawal(id),
    queryFn: () => platformApi.getWithdrawal(id),
    enabled: !!token && !!id,
    staleTime: 0,
    refetchInterval: (query) =>
      query.state.data?.status === "PROCESSING" ? 10_000 : false,
  });
}

export function usePendingOrganizationWithdrawals(params?: {
  status?: WithdrawalFiltersDto["status"];
  page?: number;
  limit?: number;
}) {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ["platform", "finance", "withdrawals", "admin", params],
    queryFn: () => platformApi.getPendingOrganizationWithdrawals(params),
    enabled: !!token,
    staleTime: 0,
    refetchInterval: 30_000,
  });
}

export function useRequestUserWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserWithdrawalRequestDto) =>
      platformApi.requestUserWithdrawal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.withdrawals(),
      });
    },
  });
}

export function useRequestOrganizationWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OrganizationWithdrawalRequestDto) =>
      platformApi.requestOrganizationWithdrawal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.withdrawals(),
      });
    },
  });
}

export function useRequestPlatformWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PlatformWithdrawalRequestDto) =>
      platformApi.requestPlatformWithdrawal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.withdrawals(),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.overview(),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.transactions(),
      });
    },
  });
}

export function useApproveUserWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => platformApi.approveUserWithdrawal(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.withdrawals(),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.withdrawal(id),
      });
    },
  });
}

export function useRejectUserWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data?: WithdrawalRejectRequestDto;
    }) => platformApi.rejectUserWithdrawal(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.withdrawals(),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.withdrawal(id),
      });
    },
  });
}

export function useApproveOrganizationWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => platformApi.approveOrganizationWithdrawal(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.withdrawals(),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.withdrawal(id),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.overview(),
      });
    },
  });
}

export function useRejectOrganizationWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data?: WithdrawalRejectRequestDto;
    }) => platformApi.rejectOrganizationWithdrawal(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.withdrawals(),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.withdrawal(id),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.overview(),
      });
    },
  });
}

export function useApprovePlatformWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => platformApi.approvePlatformWithdrawal(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.withdrawals(),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.withdrawal(id),
      });
    },
  });
}
